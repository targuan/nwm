/**
 * Map
 *
 **/
var Map = function() {
    this.nodes = []
    this.links = []
    this.properties = {}
    
}
Map.prototype.addNode = function(node) {
    if(node.id != 'DEFAULT') {
        this.nodes.push(node)
        node.map = this
    }
}
Map.prototype.addLink = function(link) {
    if(link.id != 'DEFAULT') {
        this.links.push(link)
        link.map = this
    }
}
Map.prototype.getNodeById = function(id) {
    for(i=0;i<this.nodes.length;i++) {
        if(id == this.nodes[i].id) return this.nodes[i]
    }
}
/**
 * Point
 *
 **/
var Point = function(x,y, origin) {
    this.x = x
    this.y = y
    this.origin = origin
}
Point.prototype.setX = function(x) {
    this.x = x
    
    return this
}
Point.prototype.setY = function(y) {
    this.y = y
    
    return this
}
Point.prototype.setXY = function(x, y) {
    this.x = x
    this.y = y
    
    return this
}
Point.prototype.setPoint = function(point) {
    this.x = point.x
    this.y = point.y
    
    return this
}
Point.prototype.getCouple = function() {
    return this.x + "," + this.y
}
Point.prototype.distance = function(point) {
    return Math.sqrt(Math.pow(point.x-this.x,2)+Math.pow(point.y-this.y,2))
}
Point.prototype.copy = function() {
    return new Point(this.x, this.y)
}
Point.prototype.moveBy = function(u) {
    this.x += u.x
    this.y += u.y
    
    return this
}
/**
 * Vector
 *
 **/
var Vector = function(x, y) {
    this.x = x || 0
    this.y = y || 0
}
Vector.prototype.add = function(v) {
    this.x += v.x
    this.y += v.y
    
    return this
}
Vector.prototype.substract = function(v) {
    this.x -= v.x
    this.y -+ v.y
    
    return this
}
Vector.prototype.multiply = function(a) {
    this.x = this.x * a
    this.y = this.y * a
    
    return this
}
Vector.prototype.opposite = function() {
    this.x = -this.x
    this.y = -this.y
    
    return this
}
Vector.prototype.norm = function() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
}
Vector.prototype.normalize = function(a) {
    a = a || 1
    this.multiply(a/this.norm())
    
    return this
}
Vector.prototype.orthogonal = function() {
    v = Vector.copy(this)
    this.x = -v.y
    this.y = v.x
    
    return this
}
Vector.prototype.scalar_product = function(v) {
    return Vector.scalar_product(this, v)
}

Vector.copy = function(u) {
    return new Vector(u.x, u.y)
}
Vector.fromPoint = function(P0) {
    return new Vector(P0.x, P0.y)
}
Vector.fromSegment = function(P0, P1) {
    return new Vector(P1.x - P0.x, P1.y - P0.y)
}
Vector.add = function(u, v) {
    return new Vector(u.x + v.x, u.y+v.y)
}
Vector.scalar_product = function(u,v) {
    return u.x * v.x + u.y * v.y
}

/**
 * Size
 *
 **/
var Size = function(w,h) {
    this.w = w
    this.h = h
}
/**
 * Node
 *
 **/
var Node = function(id) {
    this.id = id
    this.position = new Point(0, 0)
    this.properties = {}
}

/**
 * Link
 *
 **/
var Link = function(id) {
    this.a = null
    this.z = null
    this.id = id
    this.properties = []
    
    this.via = []
}
Link.prototype.setNodes = function(nodes) {
    this.a = nodes[0]
    this.z = nodes[1]
}
Link.prototype.getNodes = function() {
    return [this.map.getNodeById(this.a.id), this.map.getNodeById(this.z.id)]
}
Link.prototype.addVia = function(point) {
    this.via.push(point)
}
Link.prototype.getSkel = function() {
    return this.getPoints()
}
Link.prototype.getPoints = function() {
    var points = [this.getNodes()[0].position].concat(this.via)
    points.push(this.getNodes()[1].position)
    
    return points
}

var Curve = function(points) {
    this._points = points
    this._curve = null
    if(!Array.isArray(points)) {
        throw new Error("Curve takes a list of points " + typeof(points) + " given");
    }
    if(points.length < 2) {
        throw new Error("A curve need at least 2 points");
    }
    if(points.length == 2) {
        this._curve = new Line(points[0], points[1])
    } else if(points.length == 3) {
        this._curve = Bezier.quadraticFromPoints(points[0], points[1], points[2])
    } else {
        this._curve = PolyBezier.fromPoints(points)
    }
}
Curve.prototype.toSVG = function() {
    return this._curve.toSVG()
}
Curve.prototype.split = function(t) {
    return this._curve.split(t)
}
Curve.prototype.offset = function(distance) {
    return this._curve.offset(distance)
}
Curve.prototype.reverse = function() {
    return new Curve(this._points.reverse())
}

var Line = function(a,z) {
    this.a = a
    this.z = z
}
Line.prototype.toSVG = function() {
    return 'M' + this.a.x + ',' + this.a.y + 'L' + this.z.x + ',' + this.z.y
}
Line.prototype.offset = function(distance) {
    var u = Vector.fromSegment(this.a, this.z)
    u.orthogonal().normalize(distance)
    
    a = this.a.copy()
    z = this.z.copy()
    
    a.moveBy(u)
    z.moveBy(u)
    
    return new Line(a,z)
}
Line.prototype.split = function(t) {
    return {left: this, right: this}
}
var Helper = function() {}

Helper.getStroke = function(link, distance) {
    var distance = distance ||5;
    curve = new Curve(link.getPoints())
    
    pcurve = curve.split(0.5).left.offset(distance)
    if(Array.isArray(pcurve)) {
        pcurve = new PolyBezier(pcurve)
    }
    
    ncurve = curve.reverse().split(0.5).right.offset(distance)
    if(Array.isArray(ncurve)) {
        ncurve = new PolyBezier(ncurve)
    }
    return pcurve.toSVG() + " " + ncurve.toSVG().replace(/^M/,'L')
}
Helper.getFirstStroke = function(link, distance) {
    var distance = distance ||5;
    curve = new Curve(link.getPoints())
    
    pcurve = curve.split(0.5).left.offset(distance)
    if(Array.isArray(pcurve)) {
        pcurve = new PolyBezier(pcurve)
    }
    
    ncurve = curve.reverse().split(0.5).right.offset(distance)
    if(Array.isArray(ncurve)) {
        ncurve = new PolyBezier(ncurve)
    }
    return pcurve.toSVG() + " " + ncurve.toSVG().replace(/^M/,'L')
}
Helper.getSecondStroke = function(link, distance) {
    var distance = distance ||5;
    curve = new Curve(link.getPoints())
    
    pcurve = curve.split(0.5).right.offset(distance)
    if(Array.isArray(pcurve)) {
        pcurve = new PolyBezier(pcurve)
    }
    
    ncurve = curve.reverse().split(0.5).left.offset(distance)
    if(Array.isArray(ncurve)) {
        ncurve = new PolyBezier(ncurve)
    }
    return pcurve.toSVG() + " " + ncurve.toSVG().replace(/^M/,'L')
}
Helper.getD = function(link) {
    curve = new Curve(link.getPoints()).split(0.5).left
    return curve.toSVG()
}
