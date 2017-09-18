/**
* Poly Bezier
*/
var PolyBezier = function(curves) {
    this.curves = [];
    this._3d = false;
    if(!!curves) {
        this.curves = curves;
        this._3d = this.curves[0]._3d;
    }
}

PolyBezier.prototype = {
    valueOf: function() {
        return this.toString();
    },
    toString: function() {
        return "[" + this.curves.map(function(curve) {
            return utils.pointsToString(curve.points);
        }).join(", ") + "]";
    },
    addCurve: function(curve) {
        this.curves.push(curve);
        this._3d = this._3d || curve._3d;
    },
    length: function() {
        return this.curves.map(function(v) { return v.length(); }).reduce(function(a,b) { return a+b; });
    },
    curve: function(idx) {
        return this.curves[idx];
    },
    bbox: function() {
        var c = this.curves;
        var bbox = c[0].bbox();
        for(var i=1; i<c.length; i++) {
            utils.expandbox(bbox, c[i].bbox());
        }
        return bbox;
    },
    offset: function(d) {
        var offset = [];
        this.curves.forEach(function(v) {
            offset = offset.concat(v.offset(d));
        });
        return new PolyBezier(offset);
    },
    toSVG: function() {
      return this.curves.map(function(v) { return v.toSVG(); })
      .reduce(function(a,b) { return a+b.replace(/^M/,'L')})
     },
    split: function(t) {
        var left = new PolyBezier()
        var right = new PolyBezier()
        l = this.length() * t
        cum = 0
        on_right_side = false
        for(i=0;i<this.curves.length;i++) {
            var cl = this.curves[i].length()
            
            if(!on_right_side && (cum+cl) > l) {
                left_length = l-cum
                // Where do we need to split the current curve to have the global t
                curve_t = left_length/cl
                var parts = this.curves[i].split(curve_t)
                left.addCurve(parts.left)
                right.addCurve(parts.right)
                on_right_side = true
            } else if(on_right_side) {
                right.addCurve(new Bezier(this.curves[i].points))
            } else {
                left.addCurve(new Bezier(this.curves[i].points))
            }
            cum += cl
        }
        return {left: left, right: right}
    },
    reverse: function() {
        var polybezier = new PolyBezier()
        var curves = this.curves.reverse()
        for(var i=0;i<curves.length;i++) {
            polybezier.addCurve(new Bezier(curves[i].points.reverse()))
        }
        return polybezier
    }
};

PolyBezier.fromPoints = function(points) {
    var curve = new PolyBezier()
    var ratio = 5
    var points_size = points.length
    
    P0 = points[0]
    P1 = points[1]
    P2 = points[2]
    control_point = P1.copy().moveBy(Vector.fromSegment(P2,P0).multiply(1/ratio))
    
    for(i=1;i<points.length-1;i++) {
        P0 = points[i-1]
        P1 = points[i]
        P2 = points[i+1]
        
        prev_control_point = control_point
        control_point = P1.copy().moveBy(Vector.fromSegment(P2,P0).multiply(1/5))
        
        curve.addCurve(new Bezier(P0, prev_control_point, control_point, P1))
        
        control_point = P1.copy().moveBy(Vector.fromSegment(P0,P2).multiply(1/5))
    }
    
    curve.addCurve(new Bezier(points[points.length-2], control_point, control_point, points[points.length-1]))
    
    return curve
}