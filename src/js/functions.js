/* eslint-disable no-param-reassign */

import $ from 'jquery';

$(() => {
  // Declare variables
  let scoreP1 = 0;
  let scoreP2 = 0;
  let isP1Turn = true;
  let symbolP1 = 'X';
  let symbolP2 = 'O';
  let isActive = true;
  let modeAI = false;
  let result = '';

  // =========================== Helper Functions ==================================================

  // function to start a new game
  function start() {
    $('.gameBoard td').each(function a() {
      $(this).text('');
      $(this).removeClass('win Player1 Player2 marked tdHover Computer');
    });
    if (symbolP1 === 'X') {
      isP1Turn = true;
      $('.turn2').removeClass('visible');
      $('.turn1').addClass('visible');
    } else {
      isP1Turn = false;
      $('.turn1').removeClass('visible');
      $('.turn2').addClass('visible');
    }
    isActive = true;
    $('.scoreBoard').fadeIn();
    $('.gameBoard').fadeIn();
    if (!isP1Turn && modeAI) {
      isActive = false;
      // random first step
      const step = Math.floor(Math.random() * 9) + 1;
      $(`#${step}`).addClass('marked Computer');
      $(`#${step}`).text(symbolP2);
      isActive = true;
      isP1Turn = true;
      $('.turn2').toggleClass('visible');
      setTimeout(() => {
        $('.turn1').addClass('visible');
      }, 300);
    }
  }

  // Helper method for config
  function configHelp() {
    $('.config').fadeOut('slow', () => {
      $('.XO').fadeIn('slow', () => {
        $('#X').on('click', () => {
          symbolP1 = 'X';
          symbolP2 = 'O';
          $('.XO').fadeOut('slow', () => {
            start();
          });
        });
        $('#O').on('click', () => {
          symbolP1 = 'O';
          symbolP2 = 'X';
          $('.XO').fadeOut('slow', () => {
            start();
          });
        });
      });
    });
  }

  // Configure the game from use input
  function config() {
    scoreP1 = 0;
    scoreP2 = 0;
    $('.scoreBoard').css('display', 'none');
    $('#score1').text(scoreP1);
    $('#score2').text(scoreP2);
    $('.config').fadeIn('slow', () => {
      $('#double').on('click', () => {
        modeAI = false;
        $('#nameP2').text('Player2');
        configHelp();
      });
      $('#single').on('click', () => {
        modeAI = true;
        $('#nameP2').text('Computer');
        configHelp();
      });
    });
  }

  // After a set, show the result and ask if the player want to continue
  function afterSet() {
    $('.gameBoard, .scoreBoard').fadeOut('slow', () => {
      $('.whoWin').text(result);
      $('.whoWin').fadeIn('slow', () => {
        setTimeout(() => {
          $('.whoWin').fadeOut('slow', () => {
            $('.continue').fadeIn('slow', () => {
              $('#resume').on('click', () => {
                $('.continue').fadeOut('slow', () => {
                  start();
                });
              });
              $('#restart').on('click', () => {
                $('.continue').fadeOut('slow', () => {
                  config();
                });
              });
            });
          });
        }, 1000);
      });
    });
  }

  // function to check if the game is over
  function checkWin(player) {
    const candidate = ['r1', 'r2', 'r3', 'c1', 'c2', 'c3', 'd1', 'd2'];
    for (let i = 0; i < candidate.length; i += 1) {
      const currentClass = candidate[i];
      let count = 0;
      $(`.${currentClass}`).each(function check() {
        if ($(this).hasClass(player)) {
          count += 1;
        }
      });
      // If player win
      if (count === 3) {
        $(`.${currentClass}`).each(function check() {
          $(this).addClass('win');
        });
        isActive = false;
        if (player === 'Player1') {
          scoreP1 += 1;
          $('.s1Add').toggleClass('visible');
          setTimeout(() => {
            $('.s1Add').toggleClass('visible');
          }, 1000);

          $('#score1').text(scoreP1);
        } else {
          scoreP2 += 1;
          $('.s2Add').toggleClass('visible');
          setTimeout(() => {
            $('.s2Add').toggleClass('visible');
          }, 1000);
          $('#score2').text(scoreP2);
        }
        result = `${player} Win!`;
        setTimeout(() => {
          afterSet();
        }, 1000);
      }
    }
    // Check for draw
    if (isActive) {
      if ($('.marked').length === 9) {
        isActive = false;
        result = 'Draw!';
        setTimeout(() => {
          afterSet();
        }, 1000);
      }
    }
  }

  // Helper method to create an array representation of the board
  function currentBoard() {
    const board = [];
    // +1 for AI, -1 for user, 0 for unmarked unit
    $('.gameBoard td').each(function transform() {
      if (!$(this).hasClass('marked')) {
        board[$(this).attr('id') - 1] = 0;
      } else if ($(this).hasClass('Computer')) {
        board[$(this).attr('id') - 1] = 1;
      } else {
        board[$(this).attr('id') - 1] = -1;
      }
    });
    return board;
  }

  // Helper method for AI to evaluate step, return null if it is not game over state.
  function evaluation(board, step) {
    // check for column
    for (let i = 0; i < 3; i += 1) {
      const sumCol = board[i] + board[i + 3] + board[i + 6];
      if (sumCol === 3) {
        return 10 - step;
      } else if (sumCol === -3) {
        return step - 10;
      }
    }
    // Check for row
    for (let i = 0; i <= 6; i += 3) {
      const sumRow = board[i] + board[i + 1] + board[i + 2];
      if (sumRow === 3) {
        return 10 - step;
      } else if (sumRow === -3) {
        return step - 10;
      }
    }
    // Check for two diagonals
    const sumD1 = board[0] + board[4] + board[8];
    const sumD2 = board[2] + board[4] + board[6];
    if (sumD1 === 3 || sumD2 === 3) {
      return 10 - step;
    } else if (sumD1 === -3 || sumD2 === -3) {
      return step - 10;
    }
    // If the game is still going
    if (board.includes(0)) {
      return null;
    }
    // draw
    return 0;
  }

  // implementing Minmax (with Alpha–beta pruning) algorithm
  function minMax(board, isMax, alpha, beta, step) {
    if (evaluation(board, step) !== null) {
      return evaluation(board, step);
    }

    if (isMax) {
      for (let i = 0; i < 9; i += 1) {
        if (board[i] === 0) {
          const newBoard = board.slice();
          newBoard[i] = 1;
          const value = minMax(newBoard, false, alpha, beta, step + 1);
          if (value > alpha) alpha = value;
          if (alpha >= beta) break; // beta cut-off
        }
      }
      return alpha;
    }
    for (let i = 0; i < 9; i += 1) {
      if (board[i] === 0) {
        const newBoard = board.slice();
        newBoard[i] = -1;
        const value = minMax(newBoard, true, alpha, beta, step + 1);
        if (value < beta) beta = value;
        if (alpha >= beta) break; // alpha cut-off
      }
    }
    return beta;
  }

  // AI strategy to find the best Move
  function bestMove(board) {
    let bestMoveNumber = null;
    let best = -Infinity;
    for (let i = 0; i < 9; i += 1) {
      if (board[i] === 0) {
        const newBoard = board.slice();
        newBoard[i] = 1;
        const value = minMax(newBoard, false, -Infinity, Infinity, 0);
        if (value > best) {
          best = value;
          bestMoveNumber = i;
        }
      }
    }
    return bestMoveNumber;
  }

  // Making moves
  $('.gameBoard td').on('click', function removeHover() {
    $(this).removeClass('tdHover'); // remove hover effect

    if (isActive) {
      // Two Players
      if (!modeAI) {
        if (!$(this).hasClass('marked')) {
          $(this).addClass('marked');
          if (isP1Turn) {
            $(this).text(symbolP1);
            $(this).addClass('Player1');
            checkWin('Player1');
          } else {
            $(this).text(symbolP2);
            $(this).addClass('Player2');
            checkWin('Player2');
          }
          if (isActive) {
            isP1Turn = !isP1Turn;
            if (isP1Turn) {
              $('.turn2').toggleClass('visible');
              setTimeout(() => {
                $('.turn1').toggleClass('visible');
              }, 300);
            } else {
              $('.turn1').toggleClass('visible');
              setTimeout(() => {
                $('.turn2').toggleClass('visible');
              }, 300);
            }
          }
        }
      } else if (!$(this).hasClass('marked')) {
        // AI mode
        $(this).addClass('marked Player1');
        $(this).text(symbolP1);
        checkWin('Player1');
        if (isActive) {
          $('.turn1').toggleClass('visible');
          setTimeout(() => {
            $('.turn2').toggleClass('visible');
          }, 300);
          isActive = false;
          const step = 1 + bestMove(currentBoard());
          $(`#${step}`).addClass('marked Computer');
          $(`#${step}`).text(symbolP2);
          isActive = true;
          checkWin('Computer');
          if (isActive) {
            isP1Turn = true;
            $('.turn2').toggleClass('visible');
            setTimeout(() => {
              $('.turn1').toggleClass('visible');
            }, 500);
          }
        }
      }
    }
  });

  // ================================================================================

  $('#score1').text(scoreP1);
  $('#score2').text(scoreP2);
  // Configure the game
  config();

  // Hover effect on td
  $('.gameBoard td').on('mouseenter', function h() {
    if (isActive && !$(this).hasClass('marked')) {
      $(this).addClass('tdHover');
      if (isP1Turn) {
        $(this).text(symbolP1);
      } else {
        $(this).text(symbolP2);
      }
    }
  });
  $('.gameBoard td').on('mouseleave', function l() {
    $(this).removeClass('tdHover');
    if (isActive && !$(this).hasClass('marked')) {
      $(this).text('');
    }
  });
});
