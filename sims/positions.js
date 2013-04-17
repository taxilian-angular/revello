function isCorner(pos) {
    return (pos.r==0 || pos.r==7) && (pos.c==0 || pos.c==7);
}


function isCornerOrAdjacent(pos) {
    return (pos.r==0 || pos.r==1 || pos.r==6 || pos.r==7) && (pos.c==0 || pos.c==1 || pos.c==6 || pos.c==7);
}


function isCornerAdjacent(pos) {
    return isCornerOrAdjacent(pos) && !isCorner(pos);
}

function isMiddle4x4(pos) {
    return pos.r>=2 && pos.r<=5 && pos.c>=2 && pos.c<=5;
}

module.exports = {
    isCorner: isCorner,
    isCornerOrAdjacent: isCornerOrAdjacent,
    isCornerAdjacent: isCornerAdjacent,
    isMiddle4x4: isMiddle4x4
};

