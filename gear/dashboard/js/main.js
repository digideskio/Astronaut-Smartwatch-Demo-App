(function() {
    var sBand = SVG('s').size(150, 150);
    //sBand.path().M({x: 0, y: 80}).A(80, 80,  0, 0, 1, {x: 80, y: -80}).stroke({ color: '#f06', width: 100 }).fill('none');
    //sBand.path().m({x: 0, y: 80}).C({x: 40, y: 40}, {x: 40, y: 40} , 80, 0).fill('#f00');
    sBand.path().M({x: 0, y: 40}).Q({x: 20, y: 20}, {x: 40, y: 0}).stroke('#f00');
}());