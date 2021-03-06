/**
 *
      _   _ __  __ _     
__  _| | | |  \/  | |    
\ \/ / | | | |\/| | |    
 >  <| |_| | |  | | |___ 
/_/\_\\___/|_|  |_|_____|
                         
Inspired on:
  - http://cortezcristian.com/xkanvas/library/xkanvas-source-1.0.js
  - http://cortezcristian.com/xkanvas/test.html
  - http://cortezcristian.com/xpm2canvas/

* Graphics plugin
* @author Cristian Cortez  
* @requires jQuery JavaScript Library v2.1.1 or above - http://jquery.com/
* @requires KineticJS JavaScript Framework v5.1.0 or above - http://www.kineticjs.com/
* 
*/

/**
 * xUmlRenderer Global Namespace
 * @module xUmlRenderer
 */
var xUml = window.xUml = {};
/*
 * xUmlRenderer Version
 * @property ver
 * @type string
 */
xUml.ver = '1.0';

/*
 * xUmlRenderer Extend utility
 * @namespace xUmlRenderer
 * @method Extend
 * @param {Object} obj1 Child Class Object
 * @param {Object} obj2 Parent Class Object
 */
xUml.extend = function(obj1, obj2) {
    for(var key in obj2.prototype) {
        if(obj2.prototype.hasOwnProperty(key) && obj1.prototype[key] === undefined) {
            obj1.prototype[key] = obj2.prototype[key];
        }
    }
}

xUml.override = function(obj1, obj2) {
    for(var key in obj2) {
        obj1[key] = obj2[key];
    }
}

xUml.log = function(a){try{console.log(a);} catch(e) {}};

/*
    http://james.padolsey.com/javascript/get-document-height-cross-browser/
*/
xUml.getDocHeight = function() {
    var D = document;
    return Math.max(
        Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
        Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
        Math.max(D.body.clientHeight, D.documentElement.clientHeight)
    );
}

/**
* Global Objects
*/

xUml.stage = {};
xUml.desktop = {};
xUml.desktopBar = {};
xUml.desktopCon = {};
xUml.WIDTH = "";
xUml.HEIGHT = "";
xUml.container = "";
xUml.classes = [];
xUml.relations = [];

/**
* Draw relationships
*/
xUml.relDraw = function(){
    //Remove Arrows
    $.each(xUml.desktop.get(".arrow"), function(i,v){
        v.remove();
    });
    // Rebuild relationships
    $.each(xUml.relations, function(i,v){
        console.log(xUml.relations[i].from, xUml.relations[i].to);
        xUml.relArrow(xUml.relations[i].from, xUml.relations[i].to);
    });
};

/**
* Selection
*/
xUml.selection = {};
xUml.selection.mode = {
    on: false,
    step: 0
};
xUml.selection.data = {
    from: '',
    to: ''
};
xUml.selection.start = function(){
    xUml.selection.mode.on = true;
}
xUml.selection.stop = function(){
    xUml.selection.mode.on = false;
    xUml.selection.data.from = "";
    xUml.selection.data.to = "";
}

/**
* Global Gradient / Shadows Objects Mixin
*/
xUml.gradients = {};
xUml.shadows = {};
xUml.shadows.global = function(){
    return {
          color: 'black',
          blur: 1,
          offset: [0, 2],
          alpha: 0.3
        };
};
xUml.gradients.dark = function(){
    //xUml.desktop.getContext()
    var grad = {
        start: {
          x: -50,
          y: -50
        },
        end: {
          x: 50,
          y: -50
        },
        colorStops: [0, '#6d6b68', 0.3, "#595854",1, '#3c3b37']
      };
    return 'black';
}
xUml.gradients.blue = function(){
    //xUml.desktop.getContext()
    var grad = {
        start: {
          x: -50,
          y: 0
        },
        end: {
          x: xUml.HEIGHT,
          y: xUml.WIDTH
        },
        colorStops: [0, '#164b69', 1, '#56b5ea']
      };
    return 'blue';
}
xUml.gradients.orange = function(){
    //xUml.desktop.getContext()
    var grad = {
        start: {
          x: 0,
          y: 0
        },
        end: {
          x: 0,
          y: 50
        },
        colorStops: [0, '#F16C3A', 0.1, "#F16C3A", 0.4, "#F84705", 1, '#F87240']
      };
    return 'orange';
}


/**
* Init Method
*/
xUml.init = function(o){
    //TODO: add right click support: document.oncontextmenu = function(e) {alert("a"); return false;} 
    var obj = {
        container: "container",
        width: window.innerWidth || window.screen.width,
        height: xUml.getDocHeight() || window.screen.height
    }
    xUml.override(obj, o);
   
    xUml.WIDTH = obj.width;
    xUml.HEIGHT = obj.height;
    //console.dir(obj);
     
    xUml.stage = new Kinetic.Stage({
        container: obj.container,
        width: obj.width,
        height: obj.height
    });

    $('#'+obj.container).prepend('<div id="canvas-textareas" style="display:block"></div>');
    xUml.container = '#'+obj.container+' #canvas-textareas';
    
    xUml.desktopBg = new Kinetic.Rect({
      x: 0,
      y: 0,
      width: xUml.WIDTH,
      height: xUml.HEIGHT,
      fill: 'white'
    });
    
    var d = new Date(),
    h = (d.getHours() < 10 ? '0' + d.getHours() : d.getHours()),
    m = (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()),
    s = (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds()),
    da = (d.getDate() < 10 ? '0' + d.getDate() : d.getDate()),
    mo = (d.getMonth() < 10 ? '0' + (d.getMonth() + 1): d.getMonth()),
    text = d.toString().substring(0,3) + ' ' + da + ' ' + d.toString().substring(4,7) + ', ' + h + ':' + m + ':' + s ;
    
    
    var clockLabel = new Kinetic.Text({
        x: xUml.WIDTH - 150,
        y: xUml.HEIGHT - 40,
        text: text,
        alpha: 0.9,
        fontSize: 10,
        fontFamily: "Arial",
        fill: "#999",
        padding: 15,
        align: "left",
        verticalAlign: "middle",
        name: "mainClock",
        fontStyle: "normal"
    });
    
    xUml.desktop  = new Kinetic.Layer({x:0});
    xUml.desktop.add(xUml.desktopBg);
    xUml.desktop.add(clockLabel);
    xUml.desktopCon  = new Kinetic.Layer({x:60}); /*Desktop container*/
    xUml.desktopBar  = new Kinetic.Layer();
    //init apps
    xUml.apps.init();
}

/**
* Class Box
*/
xUml.classBox = function(o){ 
    this.conf = {
        name: "class"+new Date().getTime()+Math.floor(Math.random()*101),
        title: "Class Name",
        rectX: 90,
        rectY: 10,
        width: 150,
        attrs: [{ title: 'name', type: 'String' }],
        height: 100
    };
    
    xUml.override(this.conf, o || {});

    var rectX = this.conf.rectX, rectY = this.conf.rectY;

    this.conf.name = 'class-'+this.conf.title;

    $(xUml.container).prepend('<textarea class="textclass" id="'+this.conf.name+'"></textarea>');
    $('#'+this.conf.name).on('blur', function(e){
       var classRelated = xUml.desktop.get('.'+$(this).attr('id'));
       xUml.parseClass($(this).val(), classRelated[0].attrs)
       classRelated.remove();
       $(this).hide(); 
    })
    .keyup(function(e) {
          if (e.keyCode == 27) { $(this).trigger('blur'); }
    });
    var tmp = "C "+this.conf.title+"\n";
        
    this.grp = new Kinetic.Group({
        x: rectX,
        y: rectY,
        stroke: "red",
        strokeWidth: 1,
        name: this.conf.name,
        draggable: true
    });
    
    var txtTitle = new Kinetic.Text({
        x: 7,
        y: 0,
        text: this.conf.title,
        name: "class-title-"+o.title,
        fontSize: 16,
        fontFamily: "Arial",
        fill: "black",
        padding: 10,
        align: "left",
        verticalAlign: "middle"
    });

    var sepLine = new Kinetic.Line({
        points: [0,30,this.conf.width,30],
        stroke: 'black',
        tension: 12,
        lineCap: 'round',
        lineJoin: 'round',
        name: "sepLine"
    });

    var box = new Kinetic.Rect({
      x: 0,
      y: 0,
      width: this.conf.width,
      height: (this.conf.attrs.length+1)*26,
      cornerRadius: 5,
      fill: 'white',
      shadow: xUml.shadows.global(),
      stroke: 'black',
      strokeWidth: 2,
      name: "box"
    });
    
    this.grp.add(box);
    this.grp.add(sepLine);
    this.grp.add(txtTitle);
    var selfobj = this;
    $.each(this.conf.attrs, function(i,v){
        var attrsTitle = new Kinetic.Text({
            x: 7,
            y: 24*(i+1),
            text: v.title,
            name: "attr-"+selfobj.conf.title+"-"+v.title,
            fontSize: 16,
            fontFamily: "Arial",
            fill: "black",
            padding: 10,
            align: "left",
            verticalAlign: "middle"
        });
        selfobj.grp.add(attrsTitle);
        tmp += 'a '+v.title+'\n';
    });
    $('#'+this.conf.name).val(tmp);
    this.grp.conf = this.conf;
    this.grp.on("click", function() {
        // this.moveToTop();
        if(xUml.selection.mode.on){
            switch(xUml.selection.mode.step){
                case 0:
                    console.log('Clicked'+this.attrs.name);
                    /* First selection */
                    xUml.selection.mode.step = 1;
                    xUml.selection.data.from = this.attrs.name;
                break;
                case 1:
                    console.log('Clicked'+this.attrs.name);
                    if(xUml.selection.data.from != this.attrs.name){
                        xUml.selection.mode.step = 0;
                        xUml.selection.data.to = this.attrs.name;
                        var dataConf = {
                            from : xUml.selection.data.from,
                            to : xUml.selection.data.to
                        };
                        xUml.relations.push(dataConf);
                        xUml.relArrow();
                        //socket.emit('relCreated', { conf: dataConf });
                        xUml.selection.stop();
                    }
                break;
                default:
                    console.log('Clicked'+this.attrs.name);
            }
        }
    });
    this.grp.on("dragstart", function() {
        this.moveToTop();
    });
    
    this.grp.on("dragmove", function() {
        xUml.relDraw();
    });
    
    this.grp.on("dragend", function(e) {
        this.moveToTop();
        xUml.relDraw();
        //socket.emit('classDragEnd', { classConf: this });
    });

    this.grp.on("dblclick", function(e) {
        $('textarea#'+this.attrs.name)
            .css('left', 25+this.attrs.x+"px")
            .css('margin-top', -1+this.attrs.y+"px")
            .css('width', 10+this.children[0].attrs.width+"px")
            .css('height', 5+this.children[0].attrs.height+"px")
            .show().focus();
        console.log('DblClicked', e, this, this.parent);
    });

    return this.grp;
}

/**
* Arrow
*/
xUml.relArrow2 = function( nameFrom, nameTo, arrowType){
    var enumArrowTypes = ['-', '->', '1..*', '1..1', '<->'];
    var nodeType = xUml.desktop.get("."+nFrom)[0].nodeType;
    arrowType = arrowType || '-';
    
}

xUml.relStrat = {};
xUml.relStrat.Group = function( nFrom, nTo, arrowType) {
    // Draw
    console.log("Draw group");    
    var grpFrom = xUml.desktop.get("."+nFrom)[0],
    grpTo = xUml.desktop.get("."+nTo)[0],
    boxFrom = grpFrom.children[0].attrs,
    boxTo = grpTo.children[0].attrs,
    xStart = 0, yStart = 0, xEnd = 0, yEnd = 0;
    if(grpFrom.attrs.x <= grpTo.attrs.x){ // F -> T
        // console.log(((grpFrom.attrs.x + boxFrom.width) <= (grpTo.attrs.x + Math.round(boxTo.width/2))));
        console.log((grpFrom.attrs.x + boxFrom.width) <= (grpTo.attrs.x + boxTo.width));
        if((grpFrom.attrs.x + boxFrom.width) <= grpTo.attrs.x){// Pm1 = Xo + Wo/2
            xStart = grpFrom.attrs.x + boxFrom.width;
            yStart = grpFrom.attrs.y + Math.round(boxFrom.height/2);
            xEnd = grpTo.attrs.x;
            yEnd = grpTo.attrs.y + Math.round(boxTo.height/2);
        }else{ //too close
            if(grpFrom.attrs.y < grpTo.attrs.y){ // bottom To
                xStart = grpFrom.attrs.x + Math.round(boxFrom.width/2);
                yStart = grpFrom.attrs.y + boxFrom.height;
                xEnd = grpTo.attrs.x + Math.round(boxTo.width/2);
                yEnd = grpTo.attrs.y;
            }else{ // bottom From
                xStart = grpFrom.attrs.x + Math.round(boxFrom.width/2);
                yStart = grpFrom.attrs.y;
                xEnd = grpTo.attrs.x + Math.round(boxTo.width/2);
                yEnd = grpTo.attrs.y + boxTo.height;
            }
        }
    }else if (grpFrom.attrs.x > grpTo.attrs.x) { // T <- F
        console.log(grpFrom.attrs.x >= (grpTo.attrs.x + Math.round(boxTo.width/2)));
        if(grpFrom.attrs.x >= (grpTo.attrs.x + boxTo.width)){
            xStart = grpFrom.attrs.x;
            yStart = grpFrom.attrs.y + Math.round(boxFrom.height/2);
            xEnd = grpTo.attrs.x + boxTo.width;
            yEnd = grpTo.attrs.y + Math.round(boxTo.height/2);
        }else{
            if(grpFrom.attrs.y <= grpTo.attrs.y){ // bottom To
                xStart = grpFrom.attrs.x + Math.round(boxFrom.width/2);
                yStart = grpFrom.attrs.y + boxFrom.height;
                xEnd = grpTo.attrs.x + Math.round(boxTo.width/2);
                yEnd = grpTo.attrs.y;
            }else{ // bottom From
                xStart = grpFrom.attrs.x + Math.round(boxFrom.width/2);
                yStart = grpFrom.attrs.y;
                xEnd = grpTo.attrs.x + Math.round(boxTo.width/2);
                yEnd = grpTo.attrs.y + boxTo.height;
            }
        }
    }

    console.log([xStart, yStart, xEnd, yEnd]);
    //Depends on position but...
    var line = new Kinetic.Line({
        points: [xStart, yStart, xEnd, yEnd],
        stroke: "red",
        strokeWidth: 2,
        name: "arrow",
        lineJoin: "round"
    });
    xUml.desktop.add(line);
    xUml.desktop.draw();
};
xUml.relStrat.Shape = {};
xUml.relStrat.Shape.Text = function( nFrom, nTo, arrowType) {
    // Draw
    console.log("Draw text");    
    var textFrom = xUml.desktop.get("."+nFrom)[0],
    textTo = xUml.desktop.get("."+nTo)[0],
    grpFrom = xUml.desktop.get("."+nFrom)[0].parent,
    grpTo = xUml.desktop.get("."+nTo)[0].parent,
    boxFrom = grpFrom.get("."+nFrom)[0].attrs,
    boxTo = grpTo.get("."+nTo)[0].attrs,
    xStart = 0, yStart = 0, xEnd = 0, yEnd = 0;
    // To
    var nodeTypeTo = xUml.desktop.get("."+nTo)[0].nodeType;
    var classNameTo = xUml.desktop.get("."+nTo)[0].className;


    console.log(textFrom, grpFrom, boxFrom);
    console.log(textFrom.attrs.x, grpFrom.children[0]);

    xStart = textFrom.attrs.x + grpFrom.attrs.x + grpFrom.children[0].attrs.width - 7;
    yStart = textFrom.attrs.y + grpFrom.attrs.y + textFrom.attrs.fontSize;

    xStartA = xStart+20;
    yStartA = yStart;

    console.log('destination', nodeTypeTo, classNameTo);
    console.log(boxTo, grpTo);
    xEnd = boxTo.x;
    yEnd = boxTo.y+16;

    xEndB = xEnd-20;
    yEndB = yEnd;

    console.log([xStart, yStart, xEnd, yEnd]);
    //Depends on position but...
    var line = new Kinetic.Line({
        points: [xStart, yStart, xStartA, yStartA, xEndB, yEndB, xEnd, yEnd],
        stroke: "green",
        strokeWidth: 2,
        name: "arrow",
        lineJoin: "round"
    });
    xUml.desktop.add(line);
    xUml.desktop.draw();
};


xUml.relArrow = function ( nameFrom, nameTo, arrowType ){
    var nFrom = nameFrom || xUml.selection.data.from,
    nTo = nameTo || xUml.selection.data.to;

    // Enum all possible relations
    var enumArrowTypes = ['-', '->', '1..*', '1..1', '<->'];
    // Class name, and nodetype
    var nodeTypeFrom = xUml.desktop.get("."+nFrom)[0].nodeType;
    var classNameFrom = xUml.desktop.get("."+nFrom)[0].className;
    arrowType = arrowType || '-';

    if (typeof xUml.relStrat[nodeTypeFrom] === "function") {
        xUml.relStrat[nodeTypeFrom]( nFrom, nTo, arrowType);
    } else if (typeof xUml.relStrat[nodeTypeFrom] === "object") {
        if (classNameFrom && typeof xUml.relStrat[nodeTypeFrom][classNameFrom] === "function") {
            xUml.relStrat[nodeTypeFrom][classNameFrom]( nFrom, nTo, arrowType);
        }
    }

    console.log(classNameFrom, "<--", nodeTypeFrom);
}

/**
* Menu for Main Bar
*/
xUml.optionssMenu = {
    label: "xUmlCanvas",
    name: "xUmlCanvas",
    icon: "./img/logo.png",
    items: [{
        //submenu: true,//fijarse si tiene items
        label:"Class",
        name: "application",
        icon: "./img/ico-applications.png",
        onClick: function(){
            var classNew = new xUml.classBox({
                title: ""+new Date().getTime()+Math.floor(Math.random()*10),
                rectX : 120
            });
            xUml.desktop.add(classNew);
            xUml.desktop.draw();
            xUml.log(classNew);
            //socket.emit('classCreated', { classConf: classNew.conf });
        }
    },{
        label:"Relation",
        name: "game",
        icon: "./img/ico-games.png",
        onClick: function(){
            xUml.selection.start();
        }
    },{
        label:"About",
        name: "about",
        icon: "./img/ico-about.png",
        onClick: function(){}
    }]
}


xUml.buildMainMenu = function(){
    var mainMenu = new Kinetic.Group({x:0, y:0, name: 'start-menu'}), menuItems = [],  
        itemX = 5, itemY = 5, itemW = 60, itemH = 60, itemBoxY = 0, itemBoxW = 60,
         sMenu = xUml.optionssMenu;
   
    for(var i=0; i<sMenu.items.length;i++){
        xUml.log(sMenu.items[i].label);
        var itemBox = new Kinetic.Rect({
          x: 0,
          y: 10,
          width: itemW,
          cornerRadius: 5,
          height: itemH,
          fill: xUml.gradients.dark(),
          shadow: xUml.shadows.global(),
          stroke: "#000",
          strokeWidth: 0.4,
          name: 'box-'+sMenu.items[i].name
        });
        var itemMenuLabel = new Kinetic.Text({
            x: 0,
            y: itemH-20,
            text: sMenu.items[i].label,
            alpha: 0.9,
            width: itemW,
            fontSize: 11,
            fontFamily: "Arial",
            fill: "#d1d1d1",
            padding: 2,
            align: "center",
            verticalAlign: "middle",
            fontStyle: "normal"
        });
        menuItems[i] = new Kinetic.Group({
            x: itemX,
            y: (itemH+5)*i,
            name: sMenu.items[i].name
        });
        menuItems[i].bgBoxName = 'box-'+sMenu.items[i].name;
        menuItems[i].add(itemBox);
        menuItems[i].add(itemMenuLabel);
        menuItems[i].on('click', sMenu.items[i].onClick);
        menuItems[i].on('mouseover', function(){
            document.body.style.cursor = "pointer";
            xUml.desktopBar.get("."+this.bgBoxName)[0].attrs.fill = xUml.gradients.orange(); 
            xUml.desktopBar.draw();
        });
        menuItems[i].on('mouseout', function(){
            document.body.style.cursor = "default";
            xUml.desktopBar.get("."+this.bgBoxName)[0].attrs.fill = xUml.gradients.dark(); 
            xUml.desktopBar.draw();
        });

        //Add item to the menu
        mainMenu.add(menuItems[i]);
    } 
    
    
    return mainMenu;
}

/**
* Main Bar 
*/
xUml.mainBar = function(){

    this.bar = new Kinetic.Group({
        x: 0,
        y: 0
    });

    var grd = xUml.gradients.dark();

    var box = new Kinetic.Rect({
      x: 0,
      y: 0,
      width: 70,
      opacity: 0.6,
      height: xUml.HEIGHT,
      fill: grd,
      stroke: "#fff",
      strokeWidth: 0.1,
      name: "topBar"
    });

    var mainMenu = xUml.buildMainMenu();

    // xUml.log(mainMenu);

    this.bar.add(box);
    this.bar.add(mainMenu);
    //this.bar.add(clockLabel);
    return this.bar;
}

/**
* Applications
*/
//Namespace for apps
xUml.apps = {};

xUml.apps.init = function(){
    xUml.apps.clock();
};

xUml.apps.clock = function(name){
    setInterval(function(){
    var d = new Date(),
    h = (d.getHours() < 10 ? '0' + d.getHours() : d.getHours()),
    m = (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()),
    s = (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds()),
    da = (d.getDate() < 10 ? '0' + d.getDate() : d.getDate()),
    mo = (d.getMonth() < 10 ? '0' + (d.getMonth() + 1): d.getMonth()),
    text = d.toString().substring(0,3) + ' ' + da + ' ' + d.toString().substring(4,7) + ', ' + h + ':' + m + ':' + s ;
    //text = da + '-' + mo + '-' + d.getFullYear() + '   ' + h + ':' + m + ':' + s ;
    
    xUml.desktop.get(".mainClock")[0].setText(text);
    xUml.desktop.draw();
    },1000);
}

/**
* Renderer Method
*/

xUml.render = function(o){
    
    //adding stuff
    xUml.stage.add(xUml.desktopCon);
    xUml.stage.add(xUml.desktop);
    xUml.desktopBar.add(new xUml.mainBar());
    xUml.stage.add(xUml.desktopBar);
}

xUml.parseClass = function(text, params){
    console.log(text);
    var toParse = text.split("\n");
    var obj = {
       title : "copy",
       attrs: []    
    };
    if(params){
        obj.rectX = params.x || 0;
        obj.rectY = params.y || 0;
    }
    $.each(toParse, function(i,line){
       if(line.match(/^C .*/)){
           obj.title = line.split(" ")[1]
       } 
       if(line.match(/^a .*/)){
           obj.attrs.push({ title: line.split(" ")[1], type: 'String'});
       } 
    });

    var c =  new xUml.classBox(obj);
    xUml.desktop.add(c);
    
}

xUml.classRedraw = function(classname, text){
}

/**
* Magic starts here :)
*/
window.onload = function() {
    xUml.init({
        container: "graph-container",
        width: $("#graph-container").width() || 578,
        height: 600
    });
    xUml.render();

    xUml.log("Class drawn");
    var classRewardBox = new xUml.classBox({
        title: "Reward",
        rectX: 600,
        rectY: 300,
        attrs: [
              { title: 'name', type: 'String'} 
            , { title: 'desc', type: 'String', control: 'Textarea'}
            ]
    });
    xUml.desktop.add(classRewardBox);
    var classRuleBox = new xUml.classBox({
        title: "Rule",
        rectX: 590,
        rectY: 100,
        attrs: [
              { title: 'name', type: 'String'} 
            , { title: 'desc', type: 'String', control: 'Textarea'}
            ]
    });
    xUml.desktop.add(classRuleBox);
    var classChallengeBox = new xUml.classBox({
        title: "Challenge",
        rectX: 400,
        rectY: 200,
        attrs: [
              { title: 'name', type: 'String'} 
            , { title: 'desc', type: 'String', control: 'Textarea'}
            , { title: 'rules', type: 'Array', rel: '1..*', relTarget:'C Rule'}
            , { title: 'live', type: 'Boolean', control: 'Toggle'}
            , { title: 'idReward', type: 'ObjectId', rel: '1..1', relTarget:'C Reward'}
            ]
    });
    xUml.desktop.add(classChallengeBox);
    xUml.desktop.draw();
    xUml.relations.push({from:'attr-Challenge-idReward',to:'class-Reward'});
    xUml.relations.push({from:'attr-Challenge-rules',to:'class-Rule'});
    xUml.relDraw()

    //xUml.parseClass($('textarea').eq(0).val());
};

/**
* Socket IO: Receive events

socket.on('classCreation', function (data) {
    xUml.log("Class drawn");
    var classBox = new xUml.classBox(data.classConf);
    xUml.desktop.add(classBox);
    xUml.desktop.draw();
});

socket.on('relCreation', function (data) {
    xUml.log("Relation created");
    xUml.relations.push(data.conf);
    xUml.relDraw();
    // xUml.relArrow(data.conf.from, data.conf.to);
});

socket.on('classDrag', function (data) {
    xUml.log("Class drag");
    var config = $.parseJSON(data.classConf);
    xUml.desktop.get("."+config.attrs.name)[0].attrs.x = config.attrs.x;
    xUml.desktop.get("."+config.attrs.name)[0].attrs.y = config.attrs.y;
    xUml.relDraw();
    // xUml.desktop.draw();
}); 

*/
