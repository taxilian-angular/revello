module.exports = [{
    type: 'corner',
    pattern: /^1...../, // Any corner
    value: 1000
},{ 
    type: 'corner',
    pattern: /^11..../, // Any corner with adjacent stone
    value: 200
},{ 
    type: 'corner',
    pattern: /^11.1../, // Any corner with both adjacent stones
    value: 100 // In addition to the 200 points above
},{
    type: 'corner',
    pattern: /^01[02].../, // Playing adjacent to a corner
    value: -300
},{
    type: 'corner',
    pattern: /^0...1./, // Playing adjacent to a corner
    value: -300
},{
    type: 'edge',
    pattern: /010/,
    value: 100
},{
    type: 'edge',
    pattern: /101/,
    value: -200
},{ 
    type: 'edge',
    pattern: /0110/,
    value: 150
},{
    type: 'edge',
    pattern: /01110/,
    value: 200
},{
    type: 'edge',
    pattern: /011110/,
    value: 200
},{
    type: 'edge',
    pattern: /^111/,
    value: 50
},{
    type: 'edge',
    pattern: /^1111/,
    value: 50
},{
    type: 'edge',
    pattern: /^11111/,
    value: 50
}
];

