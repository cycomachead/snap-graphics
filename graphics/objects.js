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

// CellMorph.prototype.drawNew override, because proxying is WAY too convoluted
// Done for displaying associations
CellMorph.prototype.drawNew = function () {
    var context,
        txt,
        img,
        fontSize = SyntaxElementMorph.prototype.fontSize,
        isSameList = this.contentsMorph instanceof ListWatcherMorph
                && (this.contentsMorph.list === this.contents);

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
SpriteMorph.prototype.blockColor['api'] = new Color(120, 150, 50);

// Definition of a new Graphics Category

SpriteMorph.prototype.categories.push('graphics');
SpriteMorph.prototype.blockColor['graphics'] = new Color(200, 20, 50);

// Block specs

SpriteMorph.prototype.originalInitBlocks = SpriteMorph.prototype.initBlocks;
SpriteMorph.prototype.initBlocks = function() {

    this.originalInitBlocks();

    // Control
    this.blocks.doForEach.spec = 'for each %upvar in %l %cs',
    this.blocks.doForEach.defaults = [localize('item')]
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
        spec: 'pixel data from costume %cst'
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
}

SpriteMorph.prototype.initBlocks();

// blockTemplates proxy

var blockTemplates = function(category) {
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
        blocks.push(blockBySelector('colorFromHSV'));
        blocks.push(blockBySelector('colorFromString'));
        blocks.push(blockBySelector('newCostumeFromData'));
        blocks.push(blockBySelector('getPixelDataForCostume'));
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
    var costumes = this.costumes; // FIXME: should really call asArray
    for (var i = 1; i <= costumes.length(); i += 1) {
        if (costumes.at(i).name === name) { return i; }
    }
    return -1;
};

/* A list representing a pixel coloring. Eventually this should be a 
  * "association" since the {R:, G:, B:, A: } object is much more clear */
function pixelList(r, g, b, a) {
    return new List([r, g, b, a]);
}

/* Creates a new image from a 3-D array of pixels. 
 * This array is a list of rows, where each row is a list a list of pixels.
 * each pixel is a 4 item list: RGBA */

SpriteMorph.prototype.newCostumeFromData = function(costumeName, data) {
    var canvas  = newCanvas();
    var ctx     = canvas.getContext('2d');
    var costume = new Costume(canvas, costumeName);
    
    
    ctx = canvas.getContext("2d");
    imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);
    pixels = imagedata.data;

    //the last object will have all the transformations done on it
    newimagedata = ctx.createImageData(imagedata); //make imgdata object
    newimagedata.data.set(pixels); //add transformed pixels
    ctx.putImageData(newimagedata, 0, 0);
}

StageMorph.prototype.newCostumeFromData =
    SpriteMorph.prototype.newCostumeFromData;

/* Return a 3-D list of image data. This is currently a bad way to do things
    because Snap! lists are 64bit arrays. In the future there should be a more
    efficient way of representing data because this is an 8x waste in memory.*/
SpriteMorph.prototype.getPixelDataForCostume = function(costumeName) {
    // var costume, canvas, ctx, imagedata, px, result, row, id;
    
    if (costumeName === 'Turtle') {
    throw new Error('The Turtle costume currently isn\'t supported.');
    }
    
    id = this.getCostumeIdFromName(costumeName);
    if (id === -1) {
        throw new Error('The costume named \'' + costumeName +
            '\' could not be found.');
    }
    
    console.log(id);
    costume   = this.costumes.at(id);
    console.log(costume);
    canvas    = costume.contents;
    console.log(canvas);
    ctx       = canvas.getContext("2d");
    imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);
    px        = imagedata.data;

    result = new List();
    var x = 0, i, rowSize = canvas.width * 4;
    for (; x < px.length; x += rowSize) {
        row = new List();
        for (i = x; i < x + rowSize; i += 4) {
            row.add(pixelList(px[i], px[i + 1], px[i + 2], px[i + 3]));
        }
        result.add(row);
    }
    
    return result;
}

StageMorph.prototype.getPixelDataForCostume =
    SpriteMorph.prototype.getPixelDataForCostume;
