// SpriteBubbleMorph.proxy.dataAsMorph proxy

SpriteBubbleMorph.prototype.originalDataAsMorph = SpriteBubbleMorph.prototype.dataAsMorph;
SpriteBubbleMorph.prototype.dataAsMorph = function (data) {
        if (data instanceof Association) {
                contents = new AssociationWatcherMorph(data);
                contents.isDraggable = false;
                contents.update(true);
                contents.step = contents.update;
        } else {
                contents = this.originalDataAsMorph(data);
        }
        return contents;
}
;
// CellMorph.prototype.drawNew override, because proxying is WAY too convoluted
// Done for displaying associations
CellMorph.prototype.drawNew = function () {
    var context,
        txt,
        img,
        fontSize = SyntaxElementMorph.prototype.fontSize,
        isSameList = this.contentsMorph instanceof ListWatcherMorph &&
                (this.contentsMorph.list === this.contents);

    if (this.isBig) {
        fontSize = fontSize * 1.5;
    }

    // re-build my contents
    if (this.contentsMorph && !isSameList) {
        this.contentsMorph.destroy();
    }

    if (!isSameList) {
        if (this.contents instanceof Morph) {
            this.contentsMorph = this.contents;
        } else if (isString(this.contents)) {
            txt  = this.contents.length > 500 ?
                    this.contents.slice(0, 500) + '...' : this.contents;
            this.contentsMorph = new TextMorph(
                txt,
                fontSize,
                null,
                true,
                false,
                'left' // was formerly 'center', reverted b/c of code-mapping
            );
            if (this.isEditable) {
                this.contentsMorph.isEditable = true;
                this.contentsMorph.enableSelecting();
            }
            this.contentsMorph.setColor(new Color(255, 255, 255));
        } else if (typeof this.contents === 'boolean') {
            this.contentsMorph = SpriteMorph.prototype.booleanMorph.call(
                null,
                this.contents
            );
        } else if (this.contents instanceof HTMLCanvasElement) {
            this.contentsMorph = new Morph();
            this.contentsMorph.silentSetWidth(this.contents.width);
            this.contentsMorph.silentSetHeight(this.contents.height);
            this.contentsMorph.image = this.contents;
        } else if (this.contents instanceof Context) {
            img = this.contents.image();
            this.contentsMorph = new Morph();
            this.contentsMorph.silentSetWidth(img.width);
            this.contentsMorph.silentSetHeight(img.height);
            this.contentsMorph.image = img;
        } else if (this.contents instanceof Costume) {
            img = this.contents.thumbnail(new Point(40, 40));
            this.contentsMorph = new Morph();
            this.contentsMorph.silentSetWidth(img.width);
            this.contentsMorph.silentSetHeight(img.height);
            this.contentsMorph.image = img;
        } else if (this.contents instanceof Association) {
            this.contentsMorph = new AssociationWatcherMorph(this.contents);
            this.contentsMorph.isDraggable = false;
        } else if (this.contents instanceof List) {
            if (this.isCircular()) {
                this.contentsMorph = new TextMorph(
                    '(...)',
                    fontSize,
                    null,
                    false, // bold
                    true, // italic
                    'center'
                );
                this.contentsMorph.setColor(new Color(255, 255, 255));
            } else {
                this.contentsMorph = new ListWatcherMorph(
                    this.contents,
                    this
                );
                this.contentsMorph.isDraggable = false;
            }
        } else {
            this.contentsMorph = new TextMorph(
                !isNil(this.contents) ? this.contents.toString() : '',
                fontSize,
                null,
                true,
                false,
                'center'
            );
            if (this.isEditable) {
                this.contentsMorph.isEditable = true;
                this.contentsMorph.enableSelecting();
            }
            this.contentsMorph.setColor(new Color(255, 255, 255));
        }
        this.add(this.contentsMorph);
    }

    // adjust my layout
    this.silentSetHeight(this.contentsMorph.height()
        + this.edge
        + this.border * 2);
    this.silentSetWidth(Math.max(
        this.contentsMorph.width() + this.edge * 2,
        (this.contents instanceof Context ||
            this.contents instanceof List ? 0 :
                    SyntaxElementMorph.prototype.fontSize * 3.5)
    ));

    // draw my outline
    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');
    if ((this.edge === 0) && (this.border === 0)) {
        BoxMorph.uber.drawNew.call(this);
        return null;
    }
    context.fillStyle = this.color.toString();
    context.beginPath();
    this.outlinePath(
        context,
        Math.max(this.edge - this.border, 0),
        this.border
    );
    context.closePath();
    context.fill();
    if (this.border > 0 && !MorphicPreferences.isFlat) {
        context.lineWidth = this.border;
        context.strokeStyle = this.borderColor.toString();
        context.beginPath();
        this.outlinePath(context, this.edge, this.border / 2);
        context.closePath();
        context.stroke();

        context.shadowOffsetX = this.border;
        context.shadowOffsetY = this.border;
        context.shadowBlur = this.border;
        context.shadowColor = this.color.darker(80).toString();
        this.drawShadow(context, this.edge, this.border / 2);
    }

    // position my contents
    if (!isSameList) {
        this.contentsMorph.setCenter(this.center());
    }
};

// Definition of a new API Category

SpriteMorph.prototype.categories.push('api');
SpriteMorph.prototype.blockColor.api = new Color(120, 150, 50);

// Definition of a new Graphics Category

SpriteMorph.prototype.categories.push('graphics');
SpriteMorph.prototype.blockColor.graphics = new Color(200, 20, 50);

// Block specs

SpriteMorph.prototype.originalInitBlocks = SpriteMorph.prototype.initBlocks;
SpriteMorph.prototype.initBlocks = function() {

    this.originalInitBlocks();

    // Control
    this.blocks.doForEach.spec = 'for each %upvar in %l %cs';
    this.blocks.doForEach.defaults = [localize('item')];
    this.blocks.doForEach.dev = 'false';

    // Graphics Blocks
    this.blocks.colorFromPicker = {
        type: 'reporter',
        category: 'graphics',
        spec: 'color %clr' 
    };
    
    this.blocks.colorFromPickerAsList = {
        type: 'reporter',
        category: 'graphics',
        spec: 'color %clr as list' 
    };
    
    this.blocks.colorFromRGB = {
        type: 'reporter',
        category: 'graphics',
        spec: 'color r: %n g: %n b: %n a: %n',
        defaults: [250, 128, 64, 1]
    };
    this.blocks.colorFromRGBList = {
        type: 'reporter',
        category: 'graphics',
        spec: 'color %l'
    };
    
    this.blocks.colorFromHSV = {
        type: 'reporter',
        category: 'graphics',
        spec: 'color h: %n s: %n v: %n',
        defaults: [0.3,0.7,0.9]
    };
    this.blocks.colorFromString = {
        type: 'reporter',
        category: 'graphics',
        spec: 'magic color from %s',
        defaults: [localize('Hello!')]
    };
    
    this.blocks.newCostumeFromData = {
        type: 'command',
        category: 'graphics',
        spec: 'new costume named %s from data %l'
    };
    
    this.blocks.getPixelDataForCostume = {
        type: 'reporter',
        category: 'graphics',
        spec: 'all pixels from costume %cst'
    };

    this.blocks.getPixelXYFromCostume = {
        type: 'reporter',
        category: 'graphics',
        spec: 'pixel x: %n y: %n from %cst'
    };
    
    this.blocks.setPixelXYOfCostume = {
        type: 'command',
        category: 'graphics',
        spec: 'set pixel x: %n y: %n from %cst to %l'
    };

    
    // TODO: This block needs work.
    // The parameters don't always make sense
    // This is similar to fspecial in MATLAB
    this.blocks.reportFilter = {
        type: 'reporter',
        category: 'graphics',
        spec: 'report %filter of size %n'
    };

    this.blocks.reportConv = {
        type: 'reporter',
        category: 'graphics',
        spec: 'convolve data %l with matrix %l'
    };
    
    this.blocks.applyFilter = {
        type: 'command',
        category: 'graphics',
        spec: 'apply filter: %filter2 to costume: %cst with with inputs %l'
    };
    
    // API
    this.blocks.jsonObject = {
        type: 'reporter',
        category: 'api',
        spec: 'object from JSON %s',
        defaults: [localize('{"name":"John","surname":"Doe","age":14}')]
    };
    this.blocks.objectToJsonString = {
        type: 'reporter',
        category: 'api',
        spec: 'JSON from object %l'
    };

    this.blocks.newAssociation = {
        type: 'reporter',
        category: 'api',
        spec: '%s → %s'
    };
    this.blocks.valueAt = {
        type: 'reporter',
        category: 'api',
        spec: 'value at %s of object %s'
    };

    this.blocks.apiCall = {
        type: 'reporter',
        category: 'api',
        spec: '%method at %protocol %s with parameters %mult%s',
        defaults: ['GET', 'http://', null, null]
    };
    this.blocks.proxiedApiCall = {
        type: 'reporter',
        category: 'api',
        spec: 'proxied %method at %protocol %s with parameters %mult%s',
        defaults: ['GET', 'http://', null, null]
    };
};

SpriteMorph.prototype.initBlocks();

// blockTemplates proxy

var blockTemplates = function(category) {
    var category = category || 'graphics';
    var blocks = this.originalBlockTemplates(category); 

    function blockBySelector(selector) {
        // Can't call myself, as these blocks belong only to SpriteMorph and I may be a StageMorph as well
        var newBlock = SpriteMorph.prototype.blockForSelector(selector, true);
        newBlock.isTemplate = true;
        return newBlock;
    };

    if (category === 'variables') {
        blocks.push('=');
        blocks.push(blockBySelector('doForEach'));
    }

    if (category === 'graphics') {
        blocks.push('-');
        blocks.push(blockBySelector('colorFromPickerAsList'));
        blocks.push(blockBySelector('colorFromPicker'));
        blocks.push(blockBySelector('colorFromRGB'));
        blocks.push(blockBySelector('colorFromRGBList'));
        blocks.push(blockBySelector('colorFromHSV'));
        // blocks.push(blockBySelector('colorFromString'));
        blocks.push('-');
        blocks.push(blockBySelector('newCostumeFromData'));
        blocks.push(blockBySelector('setPixelXYOfCostume'));
        blocks.push('-');
        blocks.push(blockBySelector('getPixelDataForCostume'));
        blocks.push(blockBySelector('getPixelXYFromCostume'));
        blocks.push('-');
        blocks.push('-');
        blocks.push(blockBySelector('reportFilter'));
        blocks.push('-');
        blocks.push(blockBySelector('reportConv'));
        blocks.push('-');
        blocks.push(blockBySelector('applyFilter'));
    }

    if (category === 'api') {
        blocks.push(blockBySelector('jsonObject'));
        blocks.push(blockBySelector('objectToJsonString'));
        blocks.push('-');
        blocks.push(blockBySelector('newAssociation'));
        blocks.push(blockBySelector('valueAt'));
        blocks.push('-');
        blocks.push(blockBySelector('apiCall'));
        blocks.push(blockBySelector('proxiedApiCall'));
    };
    return blocks;
}

SpriteMorph.prototype.originalBlockTemplates = SpriteMorph.prototype.blockTemplates;
SpriteMorph.prototype.blockTemplates = blockTemplates;

StageMorph.prototype.originalBlockTemplates = StageMorph.prototype.blockTemplates;
StageMorph.prototype.blockTemplates = blockTemplates;


StageMorph.prototype.delayedRefresh = function(delay) {
    var myself = this;        
    setTimeout(function(){ myself.changed() }, delay?delay:100)
}



/******************************************************************************
 *  GRAPHICS BLOCKS *
 *****************************************************************************/
SpriteMorph.prototype.getCostumeIdFromName = function (name) {
    if (name === 'Turtle') {
        throw new Error('The Turtle costume currently isn\'t supported.');
    }
    
    var costumes = this.costumes; // FIXME: should really call asArray
    for (var i = 1; i <= costumes.length(); i += 1) {
        if (costumes.at(i).name === name) { return i; }
    }
    
    throw new Error('The costume named \'' + name + '\' could not be found.');
};

/* A list representing a pixel coloring. Eventually this should be a 
  * "association" since the {R:, G:, B:, A: } object is much more clear */
function pixelList(r, g, b, a) {
    return new List([r, g, b, a]);
}

// These functions are to deal with the stupid 1Dness of JS image data.
// There is probably a bit of optimization that could be done by not needing
// these functions, but they are handy.
function coorToLoc(x, y, width) {
    return (y * width + x) * 4;
}

function locToCoord(loc, width) {
    var y = Math.floor(loc / (width * 4));
    var x = (loc % (width * 4)) / 4;

    return {x: x, y: y};
}

/* Creates a new image from a 3-D array of pixels. 
 * This array is a list of rows, where each row is a list a list of pixels.
 * each pixel is a 4 item list: RGBA */
SpriteMorph.prototype.newCostumeFromData = function(costumeName, data) {
    // Assume that the input is a valid formatted list.
    // FIXME -- this is a really stupid thing to do in the long run.
    // I guess error checking is always the first thing to go #GradWare.
    
    if (!(data instanceof List)) {
        throw new Error('Input data must be a proper Snap! list.');
    }
    
    var height  = data.length();
    var width   = data.at(1).length();
    var canvas  = newCanvas({x: width, y: height});
    var ctx     = canvas.getContext('2d');
    var costume = new Costume(canvas, costumeName);
    var newimagedata = ctx.createImageData(width, height);
    var pixels  = newimagedata.data;
    
    // FIXME  --- use H and W
    var x = 1, y, row;
    for(; x <= data.length(); x += 1) {
        row = data.at(x);
        for(y = 1; y <= row.length(); y += 1) {
            loc = coorToLoc(x - 1, y - 1, width);
            
            pixels[loc] = data.at(x).at(y).at(1);
            pixels[loc + 1] = data.at(x).at(y).at(2);
            pixels[loc + 2] = data.at(x).at(y).at(3);
            var a = data.at(x).at(y).at(4); // FIXME -- this is HACKY!!!
            pixels[loc + 3] = a == 1 ? 255 : a;
        }
    }
    
    newimagedata.data.set(pixels); //add transformed pixels
    ctx.putImageData(newimagedata, 0, 0);
    
    this.addCostume(costume);
}

StageMorph.prototype.newCostumeFromData =
    SpriteMorph.prototype.newCostumeFromData;

/* Return a 3-D list of image data. This is currently a bad way to do things
    because Snap! lists are 64bit arrays. In the future there should be a more
    efficient way of representing data because this is an 8x waste in memory.*/
SpriteMorph.prototype.getPixelDataForCostume = function(costumeName) {
    var costume, canvas, ctx, imagedata, px, result, row, id;
    
    id        = this.getCostumeIdFromName(costumeName);
    costume   = this.costumes.at(id);
    canvas    = costume.contents;
    ctx       = canvas.getContext("2d");
    imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);
    px        = imagedata.data;

    result = new List();
    var x = 0, y = 0, i, width = canvas.width, height = canvas.height;
    for (; y < height; y += 1) {
        row = new List();
        for (x = 0; x < width; x += 1) {
            i = coorToLoc(x, y, width);
            row.add(pixelList(px[i], px[i + 1], px[i + 2], px[i + 3]));
        }
        result.add(row);
    }
    
    return result;
}

StageMorph.prototype.getPixelDataForCostume =
    SpriteMorph.prototype.getPixelDataForCostume;


SpriteMorph.prototype.getPixelXYFromCostume = function(x, y, costumeName) {
    var costume, canvas, ctx, imagedata, px, id;

    id        = this.getCostumeIdFromName(costumeName);
    costume   = this.costumes.at(id);
    canvas    = costume.contents;
    ctx       = canvas.getContext("2d");
    // TODO: Optimize this to return just a single pixel. TEST
    // ctx.getImageData(x + 1, y + 1, x + 2, y + 2);
    imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);
    px        = imagedata.data;

    // FUTURE: Enable different methods like reflections for interpolations
    if (x > canvas.width || x <= 0 || y > canvas.height || y <= 0) {
        return new List();
    }
    
    var i = coorToLoc(x - 1, y - 1, canvas.width);

    return pixelList(px[i], px[i + 1], px[i + 2], px[i + 3]);
}

StageMorph.prototype.getPixelXYFromCostume =
    SpriteMorph.prototype.getPixelXYFromCostume;
    

SpriteMorph.prototype.setPixelXYOfCostume = function(x, y, costumeName, data) {
    if (!(data instanceof List)) {
        throw new Error('Input data must be a proper Snap! list.');
    }

    var id      = this.getCostumeIdFromName(costumeName);
    var costume = this.costumes.at(id);
    var canvas  = costume.contents;
    
    if (x > canvas.width || x <= 0 || y > canvas.height || y <= 0) {
        return; // TODO: Fail silently or throw error?
    }
    
    var ctx     = canvas.getContext('2d');
    var newimagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var pixels  = newimagedata.data;

    var i = coorToLoc(x - 1, y - 1, canvas.width);

    pixels[i]     = data.at(1);
    pixels[i + 1] = data.at(2);
    pixels[i + 2] = data.at(3);
    pixels[i + 3] = data.at(4) == 1 ? 255 : data.at(4); // FIXME -- HACKY!

    newimagedata.data.set(pixels); //add transformed pixels
    ctx.putImageData(newimagedata, 0, 0);
    
    // TODO: Check for WRAPED IMAGES
    // Re-draw ourselves if we are wearing the costume being edited.
    if (this.costume.name === costumeName) {
        this.drawNew();
    }
}

StageMorph.prototype.setPixelXYOfCostume =
    SpriteMorph.prototype.setPixelXYOfCostume;
    
function convertPixelsToList(px, width, height) {
    var result = new List();
    var x = 0, y = 0, i, row;
    for (; y < height; y += 1) {
        row = new List();
        for (x = 0; x < width; x += 1) {
            i = coorToLoc(x, y, width);
            row.add(pixelList(px[i], px[i + 1], px[i + 2], px[i + 3]));
        }
        result.add(row);
    }

    return result;
}

function canvasFromList(data) {
    var height  = data.length();
    var width   = data.at(1).length();
    var canvas  = newCanvas({x: width, y: height});
    var ctx     = canvas.getContext('2d');
    var newimagedata = ctx.createImageData(width, height);
    var pixels  = newimagedata.data;
    
    // FIXME -- use H and W
    var x = 1, y, row;
    for(; x <= data.length(); x += 1) {
        row = data.at(x);
        for(y = 1; y <= row.length(); y += 1) {
            loc = coorToLoc(x - 1, y - 1, width);
            pixels[loc] = data.at(x).at(y).at(1);
            pixels[loc + 1] = data.at(x).at(y).at(2);
            pixels[loc + 2] = data.at(x).at(y).at(3);
            var a = data.at(x).at(y).at(4); // FIXME -- this is HACKY!!!
            pixels[loc + 3] = a == 1 ? 255 : a;
        }
    }
    
    newimagedata.data.set(pixels); //add transformed pixels
    ctx.putImageData(newimagedata, 0, 0);
    
    return canvas;
}
    
SpriteMorph.prototype.reportConv = function(data, matrix) {
    var canv = canvasFromList(data);
    var ctx  = canv.getContext('2d');
    var px   = ctx.getImageData(0, 0, canv.width, canv.height);
    // TODO: SERIOUS ERROR HANDLING NEEDED!!!
    var mat  = [
        matrix.at(1).at(1), matrix.at(1).at(2), matrix.at(1).at(3),
        matrix.at(2).at(1), matrix.at(2).at(2), matrix.at(2).at(3),
        matrix.at(3).at(1), matrix.at(3).at(2), matrix.at(3).at(3),
    ];
    console.log(mat);
    
    var newData = Filter.filterImage(Filter.convolute, px, mat);
    return convertPixelsToList(newData.data, canv.width, canv.height)
};

StageMorph.prototype.reportConv = SpriteMorph.prototype.reportConv;


SpriteMorph.prototype.applyFilter = function(filter, costumeName, params) {
    var id      = this.getCostumeIdFromName(costumeName);
    var costume = this.costumes.at(id);
    var canvas  = costume.contents;
    
    var ctx     = canvas.getContext('2d');
    var px      = ctx.getImageData(0, 0, canvas.width, canvas.height);

    var filterResult;
    switch (filter[0]) { // FIXME: Should reference input option directly
    case 'convolve':
        // TODO: Error Handling
        var mat  = [
            params.at(1).at(1), params.at(1).at(2), params.at(1).at(3),
            params.at(2).at(1), params.at(2).at(2), params.at(2).at(3),
            params.at(3).at(1), params.at(3).at(2), params.at(3).at(3),
        ];
    
        filterResult = Filter.filterImage(Filter.convolute, px, mat);
        break;
    case 'greyscale':
        filterResult = Filter.filterImage(Filter.grayscale, px);
        break;
    case 'transform': // Try to apply a basic canvas transform. More performant.
        // Map the coordinates from a Snap! list to the set transform function
        /* https://developer.apple.com/library/safari/documentation/AudioVideo/Conceptual/HTML-canvas-guide/MatrixTransforms/MatrixTransforms.html#//apple_ref/doc/uid/TP40010542-CH10-SW13 */
        console.log('transform');
        ctx.save();
        // TODO: Holy crap this needs error checking!!!
        console.log(params.at(1).at(1), params.at(2).at(1),
                         params.at(1).at(2), params.at(2).at(2),
                         params.at(1).at(3), params.at(2).at(3));
        ctx.setTransform(params.at(1).at(1), params.at(2).at(1),
                         params.at(1).at(2), params.at(2).at(2),
                         params.at(1).at(3), params.at(2).at(3));
        ctx.restore();
        filterResult = ctx.getImageData(0, 0, canvas.width, canvas.height);
        break;
    case 'threshold':
        filterResult = Filter.filterImage(Filter.threshold, px, params.at(0));
        break;
    default:
        return; // No Known filter, so exit.
    }
    
    if (filterResult) { // transform filter modifies canvas directly
        console.log('FILTERED');
        var newimagedata = ctx.createImageData(canvas.width, canvas.height);
        newimagedata.data.set(filterResult.data); //add transformed pixels
        ctx.putImageData(newimagedata, 0, 0);
    }


    // TODO: Check for WRAPED STATE
    // Re-draw ourselves if we are wearing the costume being edited.
    if (this.costume.name === costumeName) {
        this.changed();
        this.drawNew();
        this.changed();
    }
};

StageMorph.prototype.applyFilter = SpriteMorph.prototype.applyFilter;


// Some attempts at a better generic filtering method
// Idea from HTML5 rocks tutorial on processing images
Filter = {};
Filter.getPixels = function(img) {
    var c = this.getCanvas(img.width, img.height);
    var ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0,0,c.width,c.height);
};

Filter.getCanvas = function(w,h) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
};

// Wrapper function to apply a generic filter.
Filter.filterImage = function(filter, image, var_args) {
    console.log('FILTER');
    console.log(var_args);
    var args;
    if (image instanceof ImageData) {
        args = [ image ];
    } else {
        args = [this.getPixels(image)];
    }
    for (var i = 2; i < arguments.length; i += 1) {
        args.push(arguments[i]);
    }
    return filter.apply(null, args);
};

Filter.grayscale = function(pixels, args) {
    var d = pixels.data;
    for (var i = 0; i < d.length; i += 4) {
        var r = d[i];
        var g = d[i+1];
        var b = d[i+2];
        // CIE luminance for the RGB
        // The human eye is bad at seeing red and blue, so we de-emphasize them.
        var v = 0.2126*r + 0.7152*g + 0.0722*b;
        d[i] = d[i+1] = d[i+2] = v
    }
    return pixels;
};

Filter.threshold = function(pixels, threshold) {
    var d = pixels.data;
    for (var i = 0; i < d.length; i += 4) {
      var r = d[i];
      var g = d[i+1];
      var b = d[i+2];
      var v = (0.2126*r + 0.7152*g + 0.0722*b >= threshold) ? 255 : 0;
      d[i] = d[i+1] = d[i+2] = v;
    }
    return pixels;
};

Filter.tmpCanvas = document.createElement('canvas');
Filter.tmpCtx = Filter.tmpCanvas.getContext('2d');

Filter.createImageData = function(w,h) {
  return this.tmpCtx.createImageData(w,h);
};

Filter.convolute = function(pixels, weights, opaque) {
    console.log('CONVOLE');
    console.log('weights');
    console.log(weights);
    console.log('opaque');
    console.log(opaque);
    var side = Math.round(Math.sqrt(weights.length));
    var halfSide = Math.floor(side/2);
    var src = pixels.data;
    var sw = pixels.width;
    var sh = pixels.height;
    // pad output by the convolution matrix
    var w = sw;
    var h = sh;
    var output = Filter.createImageData(w, h);
    var dst = output.data;
    // go through the destination image pixels
    var alphaFac = opaque ? 1 : 0;
    for (var y=0; y<h; y++) {
      for (var x=0; x<w; x++) {
          var sy = y;
          var sx = x;
          var dstOff = (y*w+x)*4;
          // calculate the weighed sum of the source image pixels that
          // fall under the convolution matrix
          var r = 0, g = 0, b = 0, a = 0;
          for (var cy = 0; cy < side; cy += 1) {
            for (var cx = 0; cx < side; cx += 1) {
                var scy = Math.min(sh-1, Math.max(0, sy + cy - halfSide));
                var scx = Math.min(sw-1, Math.max(0, sx + cx - halfSide));
                // var scy = sy + cy - halfSide;
                // var scx = sx + cx - halfSide;
                if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                  var srcOff = (scy*sw+scx)*4;
                  var wt = weights[cy*side+cx];
                  r += src[srcOff] * wt;
                  g += src[srcOff + 1] * wt;
                  b += src[srcOff + 2] * wt;
                  a += src[srcOff + 3] * wt;
                }
            }
          }
          dst[dstOff] = r;
          dst[dstOff + 1] = g;
          dst[dstOff + 2] = b;
          dst[dstOff + 3] = a + alphaFac * (255 - a);
      }
    }
    return output;
};