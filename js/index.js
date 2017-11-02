$(document).ready(function() {
  var scoreP1 = 0;
  var scoreP2 = 0;
  var isP1Turn = true;
  var symbolP1 = 'X';
  var symbolP2 = 'O';
  var isActive = true;
  var modeAI = false;
  var result = '';
  var depth = 0;
  
  $('#score1').text(scoreP1);
  $('#score2').text(scoreP2);
  // Configure the game
  config();
  // Making moves
  $('.gameBoard td').on('click', function() {
    $(this).removeClass('tdHover'); //remove hover effect
    
      if (isActive) {
        // Two Players
        if (!modeAI) {
          if (!$(this).hasClass('marked')) {
            $(this).addClass('marked');
            if (isP1Turn) {
              $(this).text(symbolP1);
              $(this).addClass('Player1')
              checkWin('Player1');
            } else {
              $(this).text(symbolP2);
              $(this).addClass('Player2')
              checkWin('Player2');
            }
            if (isActive) {
              isP1Turn = !isP1Turn;
              if (isP1Turn) {
                $('.turn2').toggleClass('visible');
                setTimeout(function() {
                  $('.turn1').toggleClass('visible');
                }, 300);
              } else {
                $('.turn1').toggleClass('visible');
                setTimeout(function() {
                  $('.turn2').toggleClass('visible');
                }, 300);
              }
            }
          }
        } else {
          // AI mode
          if (!$(this).hasClass('marked')) {
            $(this).addClass('marked Player1');
            $(this).text(symbolP1);
            checkWin('Player1');
            if (isActive) {
              $('.turn1').toggleClass('visible');
              setTimeout(function() {
                $('.turn2').toggleClass('visible');
              }, 300);
              isActive = false;     
              var step = 1+ bestMove(currentBoard());
              $('#' + step).addClass('marked Computer');
              $('#' + step).text(symbolP2);
              isActive = true;
              checkWin('Computer');
              if (isActive) {
                isP1Turn = true;  
                $('.turn2').toggleClass('visible');
                setTimeout(function() {
                  $('.turn1').toggleClass('visible');
                }, 500);
              }
            }
            // console.log(currentBoard());
          }
        }
     }     
  });
  

  
  // AI strategy to find the best Move
  function bestMove(board) {
    var bestMove = null;
    var best = -Infinity;
    for (var i = 0; i < 9; i++) {
      if (board[i] == 0) {
        var newBoard = board.slice();
        newBoard[i] = 1;
        var value = minMax(newBoard, false, -Infinity, Infinity, 0);
        if (value > best) {
          best = value;
          bestMove = i;
        }
      }
    }
    return bestMove;
  }
  
  // implementing Minmax (with Alpha–beta pruning) algorithm 
  function minMax(board, isMax, alpha, beta, step) {
    if (evaluation(board, step) !== null) {
      return evaluation(board, step);
    }
    
    if (isMax) {
      for (var i = 0; i < 9; i++) {
        if (board[i] == 0) {
          var newBoard = board.slice();
          newBoard[i] = 1;
          var value = minMax(newBoard, false, alpha, beta, step + 1);
          if (value > alpha) alpha = value;
          if (alpha >= beta) break; // beta cut-off
        }
      }
      return alpha;
    } else {
      for (var i = 0; i < 9; i++) {
        if (board[i] == 0) {
          var newBoard = board.slice();
          newBoard[i] = -1;
          var value = minMax(newBoard, true, alpha, beta, step + 1);
          if (value < beta) beta = value;
          if (alpha >= beta) break; //alpha cut-off
        }
      }
      return beta;
    }
  }
  
  // Helper method to create an array representation of the board
  function currentBoard() {
    var board = [];
    // +1 for AI, -1 for user, 0 for unmarked unit
    $('.gameBoard td').each(function() {
      if(!$(this).hasClass('marked')) {
        board[($(this).attr('id')) - 1] = 0;
      } else if ($(this).hasClass('Computer')) {
        board[($(this).attr('id')) - 1] = 1;
      } else {
        board[($(this).attr('id')) - 1] = -1;
      }
    });
    return board;
  }
  
  // Helper method for AI to evaluate step, return null if it is not game over state. 
  function evaluation(board, step) {
    //check for column
    for (var i = 0; i < 3; i++) {
      var sumCol = board[i] + board[i + 3] + board[i + 6];
      if (sumCol == 3) {
        return 10 - step;
      } else if (sumCol == -3) {
        return step - 10;
      }
    }
    // Check for row
    for (var i = 0; i <= 6; i+=3) {
      var sumRow = board[i] + board[i + 1] + board[i + 2];
      if (sumRow == 3) {
        return 10 - step;
      } else if (sumRow == -3) {
        return step - 10;
      }
    }
    //Check for two diagonals
    var sumD1 = board[0] + board[4] + board[8];
    var sumD2 = board[2] + board[4] + board[6];
    if (sumD1 == 3 || sumD2 == 3) {
      return 10 - step;
    } else if (sumD1 == -3 || sumD2 == -3) {
      return step - 10;
    }
    // If the game is still going
    if (board.includes(0)) {
      return null;
    } 
    //draw
    return 0;
  }
  
  // Hover effect on td 
  $('.gameBoard td').on('mouseenter', function() {
    if (isActive && !$(this).hasClass('marked')) {
      $(this).addClass('tdHover');
      if(isP1Turn) {
        $(this).text(symbolP1);
      } else {
        $(this).text(symbolP2);
      }
    }
  });
  $('.gameBoard td').on('mouseleave', function() {
    $(this).removeClass('tdHover');
    if (isActive && !$(this).hasClass('marked')) {
      $(this).text('');
    }
  });

  
  // function to check if the game is over
  function checkWin(player) {
    var candidate = ['r1', 'r2', 'r3', 'c1', 'c2', 'c3', 'd1', 'd2'];
    for (var i = 0; i < candidate.length; i++) {
      var currentClass = candidate[i];
      var count = 0;
      $('.'+currentClass).each(function() {
        if ($(this).hasClass(player)) {
          count ++;
        }
      });
      // If player win
      if (count == 3) {
        $('.'+currentClass).each(function() {
          $(this).addClass('win');
        });
        isActive = false;
        if (player == 'Player1') {
          scoreP1 ++;
          $('.s1Add').toggleClass('visible');
          setTimeout(function () {
            $('.s1Add').toggleClass('visible');
          }, 1000);

          $('#score1').text(scoreP1);
        } else {
          scoreP2 ++;
          $('.s2Add').toggleClass('visible');
          setTimeout(function () {
            $('.s2Add').toggleClass('visible');
          }, 1000);
          $('#score2').text(scoreP2);
        }
        result = player + ' Win!';
        setTimeout(function () {
          afterSet();
        }, 1000);
      }
    }
    // Check for draw
    if (isActive) {
      if ($('.marked').length == 9) {
        isActive = false;
        result = 'Draw!';
        setTimeout(function () {
          afterSet();
        }, 1000);
      } 
    }
  }
  
  // After a set, show the result and ask if the player want to continue
  function afterSet() {
    $('.gameBoard').fadeOut('slow', function() {
      $('.whoWin').text(result);
      $('.whoWin').fadeIn('slow', function() {
        setTimeout(function() {
          $('.whoWin').fadeOut('slow', function() {
            $('.continue').fadeIn('slow', function() {
              $('#resume').on('click', function() {
                $('.continue').fadeOut('slow', function() {
                  start();
                });
              });
              $('#restart').on('click', function() {
                $('.continue').fadeOut('slow', function() {
                  config();
                });
              });
            });
          });
        }, 1000);
      });
    });
  }
  
  // function to start a new game
  function start() {
    $('.gameBoard td').each(function() {
      $(this).text('');
      $(this).removeClass('win Player1 Player2 marked tdHover Computer')
    });
    if (symbolP1 == 'X') {
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
      var step = Math.floor(Math.random()*9) + 1;
      $('#' + step).addClass('marked Computer');
      $('#' + step).text(symbolP2);
      isActive = true;
      isP1Turn = true;  
      $('.turn2').toggleClass('visible');
      setTimeout(function() {
        $('.turn1').addClass('visible');
      }, 300);
    }
  }
  
  // Configure the game from use input
  function config() {
    scoreP1 = 0;
    scoreP2 = 0;
    $('.scoreBoard').css('display', 'none');
    $('#score1').text(scoreP1);
    $('#score2').text(scoreP2);
    $('.config').fadeIn('slow', function() {
      $('#double').on('click', function() {
        modeAI = false;
        $('#nameP2').text('Player2');
        configHelp();
      });
      $('#single').on('click', function() {
        modeAI = true;
        $('#nameP2').text('Computer');
        configHelp();
      });
    });
  }
  
  // Helper method for config
  function configHelp() {
    $('.config').fadeOut('slow', function() {
      $('.XO').fadeIn('slow', function() {
        $('#X').on('click', function() {
          symbolP1 = 'X';
          symbolP2 = 'O';
          $('.XO').fadeOut('slow', function() {
            start();
          });
        });
        $('#O').on('click', function() {
          symbolP1 = 'O';
          symbolP2 = 'X';
          $('.XO').fadeOut('slow', function() {
            start();
          });
        });
      });
    });
  }
                       
});