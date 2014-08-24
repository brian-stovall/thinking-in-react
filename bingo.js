var blessed = require('blessed');

// Create a screen object.
var screen = blessed.screen();

// MAIN - Create a box perfectly centered horizontally and vertically.
var box = blessed.box({
  top: 'center',
  left: 'center',
  width: '100%',
  height: '100%'
});

// BINGOBOARD
var bingoboard = blessed.box({
  top: 10,
  left: 'center',
  width: '80%',
  height: '60%',
  tags: true,
  style: {
    fg: 'white',
  }
});

var bingologo = "\
███████ ████████╗ █████╗ ████████╗███████╗    ██████╗ ██╗███╗   ██╗ ██████╗  ██████╗ ██╗ \
██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██╔════╝    ██╔══██╗██║████╗  ██║██╔════╝ ██╔═══██╗██║ \
███████╗   ██║   ███████║   ██║   █████╗█████╗██████╔╝██║██╔██╗ ██║██║  ███╗██║   ██║██║ \
╚════██║   ██║   ██╔══██║   ██║   ██╔══╝╚════╝██╔══██╗██║██║╚██╗██║██║   ██║██║   ██║╚═╝ \
███████║   ██║   ██║  ██║   ██║   ███████╗    ██████╔╝██║██║ ╚████║╚██████╔╝╚██████╔╝██╗ \
╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚══════╝    ╚═════╝ ╚═╝╚═╝  ╚═══╝ ╚═════╝  ╚═════╝ ╚═╝ \
"

box.prepend(new blessed.Text({
    top      : 1,
    left    : 'center',
    width   : 95,
    content : bingologo,
    style   : {
      fg : 'red',
    }
}));

box.prepend(new blessed.Text({
    top     : 8,
    left    : 'center',
    content : "Welcome to State-Bingo. Let's play!",
    style   : {
      fg : 'green',
    }
}));

// INFO

// Create a bingoboard
var infobox = blessed.box({
  bottom : 0,
  left   : 'center',
  width  : '100%',
  height : '15%',
  style  : {
    fg : 'white',
  }
});

infobox.append(new blessed.Text({
    top     : 1,
    left    : 'center',
    content : 'Navigate using arrow keys - up, down, left, right',
    style   : { fg : 'blue' }
}));

infobox.append(new blessed.Text({
    top     : 2,
    left    : 'center',
    content : 'Space to select a state',
    style   : { fg : 'magenta' }
}));

infobox.append(new blessed.Text({
    top     : 3,
    left    : 'center',
    content : 'Enter to evaluate',
    style   : { fg : 'green' }
}));

// Append states
var gridpos = 0
var cbs = require('./bingostates.json').map(function(state, index) {
    if (index > 0 && (index % 3) == 0) gridpos += 1
    // console.log((index % 3)*30, gridpos*30)
    var bordercolor = index == 0 ? 'red' : 'blue'
    var statebox =  blessed.box({
        top     : ((index % 3) * 30) + 5 +'%',
        left    : (gridpos * 30) + 5 +'%',
        width   : '25%',
        height  : '25%',
        border : {
            type : 'line'
        },
        style : {
            border : {
                fg : 'blue'
            }
        }
    })
    statebox.prepend(new blessed.Text({
        top  : 'center',
        left : 'center',
        content: state.state
    }))
    return statebox
})

// Initialize
cbs.forEach(function(cb) {
    ['up','down','left','right'].forEach(function(dir) {
        cb.key(dir, function(ch, key) { navigate(dir) })
    })
    cb.key('space', function(ch, key) {
        if (cb.selected) cb.selected = false
        else cb.selected = true
        navigate('select')
    })
    cb.key('enter', function(ch, key) {
        finish()
    })
  bingoboard.append(cb)
})
var cbc = 0
var cb  = cbs[0]

// Navigation
function navigate(direction) {
  var newcbc = function(dir) {
    if (dir == 'up'    && cbc > 0) return cbc-1
    if (dir == 'left'  && cbc >= 3) return cbc-3
    if (dir == 'down'  && cbc < cbs.length-1) return cbc+1
    if (dir == 'right' && cbc < cbs.length-3) return cbc+3
    return cbc
  }

  cbs.forEach(function(cb, index) {
    cb.style.border.fg = 'blue'
    cb.children[0].style.fg = 'white'
    if (cb.selected) {
        cb.children[0].style.fg = '#EF7702'
    }
    if (index == newcbc(direction)) {
      cb.style.border.fg = '#EF7702'
      cb.focus()
    }
  })
  cbc = newcbc(direction)
  screen.render()
}

// Evaluate score
function finish() {
    cbs.forEach(function (cb) {
        console.log(cb.selected, cb.children[0].content)
    })
}

// Append our box to the screen.
box.append(bingoboard)
box.append(infobox)
screen.append(box);

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

// Focus our element.
navigate('up')

// Render the screen.
screen.render();