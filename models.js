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
}
Point.prototype.setY = function(y) {
    this.y = y
}
Point.prototype.setXY = function(x, y) {
    this.x = x
    this.y = y
}
Point.prototype.setPoint = function(point) {
    this.x = point.x
    this.y = point.y
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
    var points = [this.getNodes()[0].position].concat(this.via)
    points.push(this.getNodes()[1].position)
    
    return points
}
Link.prototype.getParallal = function(distance) {
    var points = this.getSkel()
    
    if(distance == 0) {
        return points
    }
    
    waypoint = []
    // First point
    point = points[0].copy()
    u = Vector.fromSegment(point, points[1]).orthogonal().normalize(distance)
    point.moveBy(u)
    waypoint.push(point)
    
    // Middle points
    for(i=1;i<points.length-1;i++) {
        point = points[i].copy()
        u = Vector.fromSegment(points[i-1],point).orthogonal().normalize()
        v = Vector.fromSegment(point,points[i+1]).orthogonal().normalize()
        scalar = Vector.scalar_product(u, v)
        
        delta = distance/(scalar+1)
        
        point.moveBy(Vector.add(u,v).multiply(delta))
        //point.moveBy(Vector.add(u,v).multiply(distance/2))
        
        waypoint.push(point)
        
    }
    
    // Last point
    point = points[points.length-1].copy()
    u = Vector.fromSegment(points[points.length-2], point).orthogonal().normalize(distance)
    point.moveBy(u)
    waypoint.push(point)
    
    
    return waypoint
}

d3helper = {}
// take a link and return the path for this link
var curve = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .curve(d3.curveCardinal)
var line = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .curve(d3.curveLinear)
curve = line
d3helper.curvePath = function(d) {
    inner = d.getParallal(5)
    outter = d.getParallal(-5).reverse()
    return curve(inner) + curve(outter).replace('M', 'L') + "Z"
}
d3helper.linePath = function(d) {
    inner = d.getParallal(5)
    outter = d.getParallal(-5).reverse()
    return line(inner) + line(outter).replace('M', 'L') + "Z"
}
d3helper.skelPath = function(d) {
    return curve(d.getSkel())
}