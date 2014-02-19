(function(){

//Main class holding notes
var Synthetizer = function(options){
	this.notes = {};
	this.context = new webkitAudioContext();
	this.options = $.extend({
		waveform: 0,
		gain: 0.005, 
	}, options);
}

Synthetizer.prototype.createSound = function(note){
	var oscillator = this.context.createOscillator();
	var gainNode = this.context.createGainNode();
	 
	oscillator.type = this.options.waveform;        
	 
	// Set volume of the oscillator.
	gainNode.gain.value = this.options.gain;

	oscillator.frequency.value = note.frequency;
	 
	// Route oscillator through gain node to speakers.
	oscillator.connect(gainNode);
	gainNode.connect(this.context.destination);
	 
	return oscillator;
}
Synthetizer.prototype.addNote = function(note){
	this.notes[note.name] = note;
}
Synthetizer.prototype.stopAll = function(){
	for(var i in this.notes)
		this.notes[i].stop();
}

var Note = function(name, freq, key, element, synth){
	this.oscillator;
	this.synthetizer = synth;
	this.frequency = freq;
	this.name = name;
	this.key = key;
	this.element = element
}

Note.prototype.play = function(){
	if (this.oscillator != undefined)
		return;
	this.oscillator = this.synthetizer.createSound(this);
	this.oscillator.noteOn(0);
	//Element highlight

}
Note.prototype.stop = function(){
	if (this.oscillator != undefined){
		this.oscillator.noteOff(0);
		this.oscillator.disconnect();
		this.oscillator = undefined;
		//Stop Element highlight
	}
}

var createKeyboard = function (options, keyListener){
	var synthetizer = new Synthetizer({});
	var notes= {
		"G4":{ freq:392,  		key:"a"},
		"G4#":{ freq:415.30, 	key:"é"},
		"A4":{ freq:440,  		key:"z"},
		"A4#":{ freq:466.16, 	key:"\""},
		"B4":{ freq:493.88,  	key:"e"},
		"C5":{ freq:523.25,  	key:"r"},
		"C5#":{ freq:554.37, 	key:"("},
		"D5":{ freq:587.33,  	key:"t"},
		"D5#":{ freq:622.25, 	key:"§"},
		"E5":{ freq:659.25,  	key:"y"},
		"F5":{ freq:698.46,  	key:"u"}
	}

	for (var i in notes){
		var note = notes[i];

		var myclass = (i.search("#") != -1 ? 'note-bemol' : 'note-normal');
		var btn = $("#keyboard")
			.append('<button class="note '+ myclass +'" id="'+ i.replace("#", "d") +'" data-freq="'+ note.freq +'" data-key="'+ note.freq +'" data-name="'+ i +'">'+ i + '</button>')
			.find("#"+i.replace("#", "d"));
		note = new Note(i.replace("#", "d"), note.freq, note.key, btn, synthetizer);
		synthetizer.addNote( note );
		if (note.key != undefined)
			keyListener.addKeyListener( note );
	}

	return synthetizer;
}

var KeyListener = function (){
	this.bindings = {};
	$(window).on('keydown', this.downHandler);
	$(window).on('keyup', this.upHandler);
}
KeyListener.prototype.addKeyListener = function(note){
	this.bindings[note.key] = note;
}
KeyListener.prototype.downHandler = function(event){
	var char = String.fromCharCode(event.which)
	if (this.bindings[char] != undefined){
		this.bindings[char].play();
	}
}
KeyListener.prototype.upHandler = function(event){
	var char = String.fromCharCode(event.which)
	if (this.bindings[char] != undefined){
		this.bindings[char].stop();
}

var mousedown = false;

$(document).ready(function() {
	var keyListener = new KeyListener();

	$(window).on('mousedown', function(e){
		mousedown = true;
	}).on('mouseup', function(e){
		mousedown = false;
		synthetizer.stopAll();
	})

	var synthetizer = createKeyboard({}, keyListener);
	$("#keyboard").on('mousedown', '.note', function(event) {
		synthetizer.notes[$(this).attr('id')].play();
	}).on('mouseenter', '.note', function(event) {
		if(mousedown) synthetizer.notes[$(this).attr('id')].play();
	}).on('mouseleave', '.note', function(event) {
		synthetizer.notes[$(this).attr('id')].stop();
	});
});
})();