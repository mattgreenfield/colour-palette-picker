
var colourPicker = {

    getMousePos: function(canvas, evt) {
        var rect = canvas.getBoundingClientRect();

        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    },

    // Convert RGBA to hex code http://stackoverflow.com/a/5624139/3098555
    rgbToHex: function(r, g, b) {
        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    },

    // Update the colour swatch with a given color
    updatePreview: function(color) {

        var previewSwatch = document.getElementById('js-colour-preview');
        previewSwatch.style.background = color;

        var hexInput = document.getElementById('js-colour-hex');
        hexInput.value = color;

    },

    // Function to set up the colour picker
    init: function(imageObj) {

        var _this = this;
        var padding = 0;
        var canvas = document.getElementById('myCanvas');
        var context = canvas.getContext('2d');

        // Get the colour based on mouse position and convert it to a hex code
        function getColour(event){
            var mousePos = _this.getMousePos(canvas, event);
            var x = mousePos.x - padding;
            var y = mousePos.y - padding;

            var imageData = context.getImageData(padding, padding, imageObj.width, imageObj.height);
            var data = imageData.data;
            var red = data[((imageObj.width * y) + x) * 4];
            var green = data[((imageObj.width * y) + x) * 4 + 1];
            var blue = data[((imageObj.width * y) + x) * 4 + 2];
            var hexColor = _this.rgbToHex(red, green, blue);

            _this.updatePreview(hexColor);
        };


        // Work out if we're dragging
        var mouseDown = false;

        canvas.addEventListener('mousedown', function() {
            mouseDown = true;
        }, false);

        canvas.addEventListener('mouseup', function() {
            mouseDown = false;
        }, false);

        canvas.addEventListener('mousemove', function(evt) {
            if(mouseDown){
                getColour(event);
            }
        }, false);

        // Or if we've clicked
        canvas.addEventListener('click', function(event) {
            getColour(event);
        }, false);

        // Draw the canvas
        context.drawImage(imageObj, padding, padding);

        // Set the initial state
        _this.updatePreview('white');
    },

    // Function to return a hex code and close the picker
    return: function() {

        var hex = document.getElementById('js-colour-hex').value;

        // console.log(hex);
        return hex;

    }



};



var colourPalletes = {

    populate: function(){
        var _this = this;
        var palletesContainer = document.getElementById('js-existing-colours');
        var markup = '';
        // console.log(userColours);

        // loop through each pallete and create the markup
        for( var i = 0; i < userColours.length; i++ ){
            var pallete = userColours[i];

            markup += '<div class="palette">';
            markup += '<h3>'+ pallete.name +'</h3>';
            markup += '<ul class="palette__list reset-list">';
            for( var j = 0; j < pallete.colours.length; j++ ){
                markup += '<li>';
                markup += '<button class="swatch" data-tooltip="'+ pallete.colours[j] + '" style="background: '+ pallete.colours[j] + ';"></button>';
                markup += '</li>';
            }
            markup += '<li><button class="js-add-new-button" data-pallete="'+ pallete.name +'" data-tooltip="Add New Colour">+</button></li>';
            markup += '</ul>';
            markup += '</div>';
        }

        // Add the markup to the page
        palletesContainer.innerHTML = markup;

        // Add event listers to the "Add colour" buttons
        var newColourButton = document.getElementsByClassName('js-add-new-button');
        for( var i = 0; i < newColourButton.length; i++ ){
            newColourButton[i].addEventListener('click', function(){
                var palette = this.dataset.pallete;
                console.log(palette);
                _this.addNewOpen(palette);
            });
        }
    },

    addNewOpen: function(palette){
        console.log("Adding colour to the " + palette + " palette.");
        var _this = this;

        //
        // open the colour picker
        var newColorPicker = document.getElementById('js-new-colour');
        newColorPicker.classList.remove('utility-hide');
        // set initial colour
        colourPicker.updatePreview('white');



        //
        // Get the picker value on submit
        var saveButton = document.getElementById('js-colour-submit');
        saveButton.addEventListener('click', function() {
            console.log("submitting to " + palette);
            _this.addNewSave(palette);
        }, false);

    },

    addNewSave: function(palette){
        var newColour = colourPicker.return();
        console.log("saving to " + palette);
        // console.log(palette);

        // Loop through the usercolours array untill we find the one we need to add to
        // TODO: use a different data structure??
        for( var i = 0; i < userColours.length; i++ ){
            if( userColours[i].name == palette ){

                // Add the new colour to the array
                userColours[i].colours.push(newColour);
                break;
            }
        }

        // TODO: send the new variables off to the database or something with ajax

        // Refresh the colours list
        this.populate();

        // set selected state
        // TODO: remember this from before the list was repopulated
        // colourPalletes.select();

        // remove the event listener so we can use it again next time without adding this colour agains
        // by cloning, can we remove event listeners? hmmm
        // http://stackoverflow.com/a/19470348/3098555
        var saveButton = document.getElementById('js-colour-submit');
        newButton = saveButton.cloneNode(true)
        saveButton.parentNode.replaceChild(newButton, saveButton);

        //
        // Close the colour picker
        var newColorPicker = document.getElementById('js-new-colour');
        newColorPicker.classList.add('utility-hide');

    },

    // Handle when an existing colour is selected
    select: function(){
        var swatch = document.getElementsByClassName('swatch');
        for(var i=0; i < swatch.length; i++){

            swatch[i].addEventListener('click', function() {

                // Add selected state class for the CSS
                var currentSwatch = document.getElementsByClassName('swatch--selected')[0];
                if(currentSwatch){
                    currentSwatch.classList.remove('swatch--selected');
                }
                if( this != currentSwatch){
                    this.classList.add('swatch--selected');
                }

                // return the hex?

            }, false);
        }
    }
}


//
// Initial setup

// Create a new image
var imageObj = new Image();
// Once its loaded, init the colour picker in it
imageObj.onload = function() {
    colourPicker.init(this);
};
// And then set its src so it looks like a colour picker...
imageObj.src = 'gradient.png';

// Populate the palletes lists
colourPalletes.populate();

// Handel selecting existing colours
colourPalletes.select();
