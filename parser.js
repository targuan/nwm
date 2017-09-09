var Parser = function () {
}
Parser.prototype.parse = function(text) {
    this.text = text
    this.pos = 0
    this.tokens = text
        .replace(/#[^\r\n]*/gi, ' ')
        .split(/[ \r\n\t]/)
        .filter(function(d){return d.length > 0})
    this.map = {nodes: this.nodes, links: this.links, properties: {}}
    
    this._current_node = {}
    this._current_link = {}
    
    this.START()
    
    return this.map
}
Parser.prototype.START = function() {
    this.GLOBAL()
    this.ELEMENTS()
    
    if(this.pos < this.tokens.length) {
        console.log('Unexpected token ' + this.tokens[this.pos])
    }
}

Parser.prototype.GLOBAL = function() {
    return this.GLOBAL_BACKGROUND()
        || this.GLOBAL_COLOR()
        || this.GLOBAL_DATAOUTPUTFILE()
        || this.GLOBAL_FONT()
        || this.GLOBAL_FONTDEFINE()
        || this.GLOBAL_HEIGHT()
        || this.GLOBAL_HTMLOUTPUTFILE()
        || this.GLOBAL_HTMLSTYLE()
        || this.GLOBAL_HTMLSTYLESHEET()
        || this.GLOBAL_IMAGEOUTPUTFILE()
        || this.GLOBAL_IMAGEURI()
        || this.GLOBAL_INCLUDE()
        || this.GLOBAL_KEYPOS()
        || this.GLOBAL_KEYSTYLE()
        || this.GLOBAL_KILO()
        || this.GLOBAL_MAXTIMEPOS()
        || this.GLOBAL_MINTIMEPOS()
        || this.GLOBAL_SCALE()
        || this.GLOBAL_SET()
        || this.GLOBAL_TIMEPOS()
        || this.GLOBAL_TITLE()
        || this.GLOBAL_TITLEPOS()
        || this.GLOBAL_WIDTH()
}

Parser.prototype.ELEMENTS = function() {
    while(this.NODE() || this.LINK()) {}
    return true;
}

Parser.prototype.NODE = function() {
    if(this.pos+2 > this.tokens.length) {
        return false;
    }
    if(this.tokens[this.pos] != "NODE") {
        return false;
    }
    if(!this.string(this.tokens[this.pos+1])) {
        return false;
    }
    this._current_node = {name: this.tokens[this.pos+1]}
    this.nodes.push(this._current_node)
    this.pos += 2
    
    while(this.NODE_PROPERTY()) { }
    
    return true;
}

Parser.prototype.GLOBAL_BACKGROUND = function() {
    // BACKGROUND imagefile
    if(this.tokens[this.pos] != "BACKGROUND") {
        return false;
    }
    if(typeof(this.tokens[this.pos+1]) == 'undefined') {
        return false;
    }
    this.map.properties["background"] = this.tokens[this.pos+1]
    this.pos += 2
    return true
}

Parser.prototype.GLOBAL_COLOR = function() {
    color_elements = [
        "BGCOLOR",
        "TIMECOLOR",
        "TITLECOLOR",
        "KEYTEXTCOLOR",
        "KEYOUTLINECOLOR",
        "KEYBGCOLOR"
    ]
    color_none_elements = [
        "KEYOUTLINECOLOR",
        "KEYBGCOLOR"
    ]
    if(color_elements.indexOf(this.tokens[this.pos]) == -1) {
        return false;
    }
    if(this.tokens[this.pos+1] == 'none') {
        delta = 2
        if(color_none_elements.indexOf(this.tokens[this.pos]) == -1) {
            return false;
        }
        value = null
    } else {
        delta = 4
        value = "#"
        for(i=0;i<3;i++) {
            if(!this.integer(this.tokens[this.pos+1+i])) {
                return false;
            }
            cv = parseInt(this.tokens[this.pos+1+i])
            if(cv < 0 || cv > 255) {
                return false
            }
            value += cv.toString(16)
        }
    }
    this.map.properties[this.tokens[this.pos].toLowerCase()] = value
    this.pos += delta
    return true
}

Parser.prototype.GLOBAL_DATAOUTPUTFILE = function() {
    return false
}

Parser.prototype.GLOBAL_FONT = function() {
    return false
}

Parser.prototype.GLOBAL_FONTDEFINE = function() {
    return false
}

Parser.prototype.GLOBAL_HEIGHT = function() {
    return false
}

Parser.prototype.GLOBAL_HTMLOUTPUTFILE = function() {
    return false
}

Parser.prototype.GLOBAL_HTMLSTYLE = function() {
    return false
}

Parser.prototype.GLOBAL_HTMLSTYLESHEET = function() {
    return false
}

Parser.prototype.GLOBAL_IMAGEOUTPUTFILE = function() {
    return false
}

Parser.prototype.GLOBAL_IMAGEURI = function() {
    return false
}

Parser.prototype.GLOBAL_INCLUDE = function() {
    return false
}

Parser.prototype.GLOBAL_KEYPOS = function() {
    return false
}

Parser.prototype.GLOBAL_KEYSTYLE = function() {
    return false
}

Parser.prototype.GLOBAL_KILO = function() {
    return false
}

Parser.prototype.GLOBAL_MAXTIMEPOS = function() {
    return false
}

Parser.prototype.GLOBAL_MINTIMEPOS = function() {
    return false
}

Parser.prototype.GLOBAL_SCALE = function() {
    return false
}

Parser.prototype.GLOBAL_SET = function() {
    return false
}

Parser.prototype.GLOBAL_TIMEPOS = function() {
    return false
}

Parser.prototype.GLOBAL_TITLE = function() {
    return false
}

Parser.prototype.GLOBAL_TITLEPOS = function() {
    return false
}

Parser.prototype.GLOBAL_WIDTH = function() {
    return false
}


Parser.prototype.NODE_PROPERTY = function() {
    return this.NODE_ICON() 
        || this.NODE_INFOURL()
        || this.NODE_LABEL()
        || this.NODE_LABELANGLE()
        || this.NODE_LABELFONT()
        || this.NODE_NABELOFFSET()
        || this.NODE_MAXVALUE()
        || this.NODE_NOTES()
        || this.NODE_OVERLIBCAPTION()
        || this.NODE_OVERLIBGRAPH()
        || this.NODE_OVERLIBHEIGHT()
        || this.NODE_OVERLIBWIDTH()
        || this.NODE_POSITION()
        || this.NODE_SET()
        || this.NODE_TARGET()
        || this.NODE_TEMPLATE()
        || this.NODE_USEICONSCALE()
        || this.NODE_USESCALE()
        || this.NODE_ZORDER()
}

Parser.prototype.NODE_ICON = function() {
    if(this.tokens[this.pos] != "ICON") {
        return false;
    }
    // ICON maxwidth maxheight iconimagefile
    if(this.float(this.tokens[this.pos+1]) && this.float(this.tokens[this.pos+2]) && this.string(this.tokens[this.pos+3])) {
        this._current_node.icon = {
            path: this.tokens[this.pos+3],
            maxwidth: parseFloat( this.tokens[this.pos+1]), 
            maxheight: parseFloat( this.tokens[this.pos+2])
        }
        this.pos += 4
        return true
    }
    // ICON none
    if(this.tokens[this.pos+1] == 'none') {
        this._current_node.icon =  {
            path: null,
            maxwidth: NaN,
            maxheight: NaN
        }
        this.pos += 2
        return true;
    }
    // ICON iconimagefile
    if(this.string(this.tokens[this.pos+1])) {
        this._current_node.icon =  {
            path: this.tokens[this.pos+1],
            maxwidth: NaN,
            maxheight: NaN
        }
        this.pos += 2
        return true;
    }
    return false;
}
Parser.prototype.NODE_TEMPLATE = function() {
    if(this.tokens[this.pos] != "TEMPLATE") {
        return false;
    }
    if(this.string(this.tokens[this.pos+1])) {
        this._current_node.template =  this.tokens[this.pos+1]
        this.pos += 2
        return true;
    }
    
    return false
}
Parser.prototype.NODE_POSITION = function() {
    if(this.tokens[this.pos] != "POSITION") {
        return false;
    }
    
    // POSITION nodename x-coord y-coord
    if(this.string(this.tokens[this.pos+1]) && this.float(this.tokens[this.pos+2]) && this.float(this.tokens[this.pos+3])) {
        this._current_node.position =  {
            origin: this.tokens[this.pos+1],
            x: parseFloat(this.tokens[this.pos+2]),
            y: parseFloat(this.tokens[this.pos+3]),
        }
        this.pos += 4
        return true;
    }
    // POSITION x-coord y-coord
    if(this.float(this.tokens[this.pos+1]) && this.float(this.tokens[this.pos+1])) {
        this._current_node.position =  {
            origin: null,
            x: parseFloat(this.tokens[this.pos+1]),
            y: parseFloat(this.tokens[this.pos+2]),
        }
        this.pos += 3
        return true;
    }
    
    return false
}

Parser.prototype.string = function(token) {
    re = /^[a-zA-Z][a-zA-Z0-9_-]*$/
    return (typeof(token) == "string") && re.exec(token)
}

Parser.prototype.integer = function(token) {
    re = /^\d+$/
    return (typeof(token) == "string") && re.exec(token)
}
Parser.prototype.float = function(token) {
    re = /^\d*\.\d+$/
    return (typeof(token) == "string") && re.exec(token)
}


Parser.prototype.LINK = function() {
    return false;
}



to_parse = '# some initial comments...\r\n#\r\n# This sample configuration file demonstrates most of the basic features of\r\n# PHP Weathermap, along with some of the cosmetic and layout changes possible\r\n#\r\n#\r\nBACKGROUND background.png\r\nHTMLOUTPUTFILE example.html\r\nIMAGEOUTPUTFILE example.png\r\nTITLE Network Overview\r\nHTMLSTYLE overlib\r\nKEYPOS 10 400\r\n\r\n# define some new TrueType fonts - built-in ones go from 1 to 5, so start high\r\nFONTDEFINE 100 VeraIt 8\r\nFONTDEFINE 101 Vera 12\r\nFONTDEFINE 102 Vera 9\r\n\r\nKEYFONT 102\r\n\r\nLINK DEFAULT\r\n\tBANDWIDTH 100M\r\n\tBWLABEL bits\r\n\tBWFONT 100\r\n\tOVERLIBWIDTH 395\r\n\tOVERLIBHEIGHT 153\r\n\tWIDTH 4\r\n\r\nNODE DEFAULT\r\n\tLABELFONT 101\r\n\r\nNODE transit\r\n\tPOSITION 400 180\r\n\tLABEL TRANSIT\r\n\r\n# a little splash of background colour for these nodes\r\nNODE isp1\r\n\tPOSITION 250 100\r\n\tLABEL ISP1\r\n\t\tINFOURL http://www.isp1.com/support/lookingglass.html\r\n\tLABELBGCOLOR 255 224 224\r\n\r\nNODE isp2\r\n\tPOSITION 550 100\r\n\tLABEL ISP2\r\n\tINFOURL http://www.isp2.net/portal/\r\n\tLABELBGCOLOR 224 255 224\r\n\r\nNODE core\r\n\tPOSITION 400 300\r\n\tLABEL core\r\n\tINFOURL https://core.mynet.net/admin/\r\n\r\nNODE customer1\r\n\tLABEL xy.com\r\n\tPOSITION 150 370\r\n\r\nNODE customer2\r\n\tLABEL ww.co.uk\r\n\tPOSITION 250 450\r\n\r\nNODE infra\r\n\tLABEL INFRASTRUCTURE\r\n\tPOSITION 450 450\r\n\r\n# this node has an icon, and so we push the label to the South edge of it, so it\r\n# can still be read\r\nNODE sync\r\n\tLABEL Sync\r\n\tICON my_router.png\r\n\tLABELOFFSET S\r\n\tLABELFONT 2\r\n\tPOSITION 550 370\r\n# the icon is taken from a Nagios icon pack:\r\n#   http://www.nagiosexchange.org/Image_Packs.75.0.html?&tx_netnagext_pi1[p_view]=110&tx_netnagext_pi1[page]=10%3A10\r\n\r\nNODE site1\r\n\tLABEL site1\r\n\tPOSITION 700 220\r\n\r\nNODE site2\r\n\tLABEL site2\r\n\tPOSITION 750 420\r\n\r\nLINK sync-core\r\n\tNODES sync core\r\n\tTARGET data/sync_traffic_in_259.rrd\r\n\tOVERLIBGRAPH http://support.mynet.net/cacti/graph_image.php?local_graph_id=256&rra_id=0&graph_nolegend=true&graph_height=100&graph_width=300\r\n\tINFOURL http://support.mynet.net/cacti/graph.php?rra_id=all&local_graph_id=256\r\n#\r\n# Site1 has two E1s, so we use NODE-offsets to allow them to run parallel\r\n#\r\n\r\nLINK sync-site1a\r\n\tNODES sync:N site1:W\r\n\tWIDTH 3\r\n\tTARGET data/sync_traffic_in_257.rrd\r\n\tBANDWIDTH 2M\r\n\tOVERLIBGRAPH http://support.mynet.net/cacti/graph_image.php?local_graph_id=254&rra_id=0&graph_nolegend=true&graph_height=100&graph_width=\r\n\tINFOURL http://support.mynet.net/cacti/graph.php?rra_id=all&local_graph_id=126\r\n\r\nLINK sync-site1b\r\n\tNODES sync:E site1:SE\r\n\tWIDTH 3\r\n\tOVERLIBGRAPH http://support.mynet.net/cacti/graph_image.php?local_graph_id=255&rra_id=0&graph_nolegend=true&graph_height=100&graph_width=\r\n\tTARGET data/sync_traffic_in_258.rrd\r\n\tBANDWIDTH 2M\r\n\tINFOURL http://support.mynet.net/cacti/graph.php?rra_id=all&local_graph_id=56\r\n\r\n#\r\n# site2 also has two links, but this time we use the VIA to curve the links\r\n#\r\nLINK sync-site2a\r\n\tNODES sync site2\r\n\tWIDTH 3\r\n\tVIA 650 380\r\n\tTARGET data/sync_traffic_in_251.rrd\r\n\tOVERLIBGRAPH http://support.mynet.net/cacti/graph_image.php?local_graph_id=248&rra_id=0&graph_nolegend=true&graph_height=100&graph_width=300\r\n\tBANDWIDTH 1M\r\n\tINFOURL http://support.mynet.net/cacti/graph.php?rra_id=all&local_graph_id=252\r\n\r\nLINK sync-site2b\r\n\tNODES sync site2\r\n\tWIDTH 3\r\n\tVIA 650 420\r\n\tTARGET data/sync_traffic_in_252.rrd\r\n\tOVERLIBGRAPH http://support.mynet.net/cacti/graph_image.php?local_graph_id=228&rra_id=0&graph_nolegend=true&graph_height=100&graph_width=300\r\n\tBANDWIDTH 1M\r\n\tINFOURL http://support.mynet.net/cacti/graph.php?rra_id=all&local_graph_id=561\r\n\r\n#\r\n# ISP 1 has a several links, again, but they prefer to see one arrow, and the aggregate bandwidth\r\n#   so we use multiple TARGETs on one line, here, to sum the data\r\n\r\nLINK transit-isp1\r\n\tNODES transit isp1\r\n\tTARGET data/trans1_traffic_in_352.rrd data/trans1_traffic_in_378.rrd data/trans1_traffic_in_420.rrd\r\n\tBANDWIDTH 10M\r\n\tOVERLIBGRAPH http://support.mynet.net/cacti/graph_image.php?local_graph_id=355&rra_id=0&graph_nolegend=true&graph_height=100&graph_width=\r\n\tINFOURL http://support.mynet.net/cacti/graph.php?rra_id=all&local_graph_id=633\r\n\r\nLINK transit-isp2\r\n\tNODES transit isp2\r\n\tTARGET data/trans1_traffic_in_438.rrd\r\n\tBANDWIDTH 34M\r\n\tOVERLIBGRAPH http://support.mynet.net/cacti/graph_image.php?local_graph_id=433&rra_id=0&graph_nolegend=true&graph_height=100&graph_width=300\r\n\tINFOURL http://support.mynet.net/cacti/graph.php?rra_id=all&local_graph_id=265\r\n\r\nLINK core-transit\r\n\tNODES transit core\r\n\tTARGET data/trans1_traffic_in_350.rrd\r\n\tARROWSTYLE compact\r\n\tWIDTH 4\r\n\tOVERLIBGRAPH http://support.mynet.net/cacti/graph_image.php?local_graph_id=347&rra_id=0&graph_nolegend=true&graph_height=100&graph_width=300\r\n\tINFOURL http://support.mynet.net/cacti/graph.php?rra_id=all&local_graph_id=122\r\n\r\nLINK cust1-core\r\n\tNODES customer1 core\r\n\tTARGET data/extreme_traffic_in_299.rrd\r\n\tOVERLIBGRAPH http://support.mynet.net/cacti/graph_image.php?local_graph_id=296&rra_id=0&graph_nolegend=true&graph_height=100&graph_width=300\r\n\tINFOURL http://support.mynet.net/cacti/graph.php?rra_id=all&local_graph_id=237\r\n\r\nLINK cust2-core\r\n\tNODES customer2 core\r\n\tTARGET data/extreme_traffic_in_286.rrd\r\n\tOVERLIBGRAPH http://support.mynet.net/cacti/graph_image.php?local_graph_id=283&rra_id=0&graph_nolegend=true&graph_height=100&graph_width=300\r\n\tINFOURL http://support.mynet.net/cacti/graph.php?rra_id=all&local_graph_id=222\r\n\r\nLINK infra-core\r\n\tNODES infra core\r\n\tTARGET data/extreme_traffic_in_294.rrd\r\n\tOVERLIBGRAPH http://support.mynet.net/cacti/graph_image.php?local_graph_id=291&rra_id=0&graph_nolegend=true&graph_height=100&graph_width=300\r\n\tINFOURL http://support.mynet.net/cacti/graph.php?rra_id=all&local_graph_id=228'