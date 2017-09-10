/**
 * Map
 *
 **/
var Map = function() {
    this.nodes = []
    this.links = []
}
Map.prototype.addNode = function(node) {
    node.map = this
    this.nodes.push(node)
}
Map.prototype.addLink = function(link) {
    link.map = this
    this.links.push(link)
}
/**
 * Point
 *
 **/
var Point = function(x,y) {
    this.x = x
    this.y = y
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
var Node = function(name, position, size) {
    
    if (typeof(name)==='undefined') name = ""
    if (typeof(position)==='undefined') position = new Point(0,0)
    if (typeof(size)==='undefined') size = new Size(10,10)
    
    this.name = name
    this.position = position
    this.size = size
    this.map = null
}

/**
 * Link
 *
 **/
var Link = function(a,z) {
    this.a = a
    this.z = z
    
    this.viastyle = "curved"
    this.via = []
    this.path = null
    this.map = null
}
Link.prototype.addVia = function(point) {
    this.via.push(point)
}
Link.prototype.getSkel = function() {
    var points = [this.a.position].concat(this.via)
    points.push(this.z.position)
    
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
        
        point.moveBy(Vector.add(u,v).multiply(distance/(scalar+1)))
        
        waypoint.push(point)
        
    }
    
    // Last point
    point = points[points.length-1].copy()
    u = Vector.fromSegment(points[points.length-2], point).orthogonal().normalize(distance)
    point.moveBy(u)
    waypoint.push(point)
    
    
    return waypoint
}
Link.prototype.getAngledPath = function() {
    waypoint = this.getParallal(10).concat(this.getParallal(-10).reverse())
    
    var d = "M " + waypoint[0].getCouple() + " L "
    for(i=1;i<waypoint.length;i++) {
        d += waypoint[i].getCouple() + " "
    }
    
    return d
}
Link.prototype.getCurvedPoints = function(constraint_points) {
    ratio = 5
    
    constraint_size = constraint_points.length
    waypoints = [constraint_points[0]]
    control_point = constraint_points[0].copy()
    control_point.type="control"
    
    for(i=1;i<constraint_size-1;i++) {
        P0 = constraint_points[i-1]
        P1 = constraint_points[i]
        P2 = constraint_points[i+1]
        
        if(i==0) {
            control_point = new Point((P0.x-P2.x)/ratio + P1.x, (P0.y-P2.y)/ratio + P1.y)
            control_point.type="control"
            waypoints.push(control_point)
            waypoints.push(control_point)
        } else {
            waypoints.push(control_point)
            control_point = new Point((P0.x-P2.x)/ratio + P1.x, (P0.y-P2.y)/ratio + P1.y)
            control_point.type="control"
            waypoints.push(control_point)
        }
        waypoints.push(P1)
        control_point = new Point((P2.x-P0.x)/ratio + P1.x, (P2.y-P0.y)/ratio + P1.y)
        control_point.type="control"
    }
    waypoints.push(control_point)
    control_point = constraint_points[constraint_size-1]
    control_point.type="control"
    waypoints.push(control_point)
    waypoints.push(constraint_points[constraint_size-1])
    return waypoints
}
Link.prototype.getParallalPath = function(waypoints) {
    console.log(waypoints)
}
Link.prototype.getCurvedD = function() {
    var d = ""
    
    waypoints = this.getCurvedPoints(this.getParallal(0))
    d += "M " + waypoints[0].getCouple() + " C "
    for(i=1;i<waypoints.length;i++) {
        d += waypoints[i].getCouple() + " "
    }
    
    /*waypoints = this.getCurvedPoints(this.getParallal(-10).reverse())
    d += "L " + waypoints[0].getCouple() + " C "
    for(i=1;i<waypoints.length;i++) {
        d += waypoints[i].getCouple() + " "
    }*/
    
    
    return d
}
Link.prototype.getD = function() {
    if(this.viastyle == "curved") {
        return this.getCurvedD()
    } else {
        return this.getAngledPath(map)
    }
}


d3helper = {}
// take a link and return the path for this link
var line = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .curve(d3.curveCardinal)

d3helper.arrowPath = function(d) {
    inner = d.getParallal(5)
    outter = d.getParallal(-5).reverse()
    return line(inner) + line(outter).replace('M', 'L') + "Z"
}
d3helper.skelPath = function(d) {
    return line(d.getSkel())
}