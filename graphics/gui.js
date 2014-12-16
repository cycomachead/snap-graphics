
// Allow dropping of InspectorMorphs
IDE_Morph.prototype.originalInit = IDE_Morph.prototype.init; 
IDE_Morph.prototype.init = function () {
    this.originalInit();

    originalWantsDropOf = this.wantsDropOf;
    this.wantsDropOf = function (morph) {
        return (originalWantsDropOf() || morph instanceof InspectorMorph);
    };
}

