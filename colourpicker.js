
// by cloning, can we remove event listeners? hmmm
// http://stackoverflow.com/a/19470348/3098555
function removeEventListener(element){

    newElement = element.cloneNode(true)
    element.parentNode.replaceChild(newElement, element);
}


/**
 * @param element: ID of the small preview div that you want to set the bg colour of when the user says 'yes, use this colour'.
 * @param callback: Function that'll be run when the user chooses a colour
 */
var colourPicker = function(element, callback){

    var colourGradientSelect = {

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
        respond: function() {

            var hex = document.getElementById('js-colour-hex').value;

            // console.log(hex);
            return hex;

        }


    };

    // Loop throught the userColours array and populate the palletes, add to the array
    var colourPalletes = {

        newColorPicker: document.getElementById('js-colourpicker-new'),
        saveButton: document.getElementById('js-colourpicker-new-submit'),
        cancelButton: document.getElementById('js-colourpicker-new-cancel'),

        palletesContainer: document.getElementById('js-existing-colours'),
        newColourButton: document.getElementsByClassName('js-add-new-button'),

        editPalleteButton: document.getElementsByClassName('js-edit-pallete'),

        populate: function(){
            var _this = this;
            // console.log(userColours);

            // loop through each pallete and create the markup
            var markup = '';
            for( var i = 0; i < userColours.length; i++ ){
                var pallete = userColours[i];

                markup += '<div class="palette" data-palette="'+ pallete.name +'">';
                markup += '<h3>'+ pallete.name +'</h3>';
                markup += '<button class="js-edit-pallete" data-pallete="'+ pallete.name +'">Edit Pallete</button>';
                markup += '<ul class="palette__list reset-list">';
                for( var j = 0; j < pallete.colours.length; j++ ){
                    markup += '<li>';
                    markup += '<input type="radio" name="colours" id="'+ [i] + pallete.colours[j] + '" value="'+ pallete.colours[j] + '" aria-hidden="true" style="display:none"/>';
                    markup += '<label class="swatch" for="'+ [i] + pallete.colours[j] + '" data-colour="'+ pallete.colours[j] + '" style="background: '+ pallete.colours[j] + ';"></label>';
                    markup += '</li>';
                }
                markup += '<li><button class="js-add-new-button" data-pallete="'+ pallete.name +'" data-tooltip="Add New Colour"><span>+</span></button></li>';
                markup += '</ul>';
                markup += '</div>';
            }

            // Add the markup to the page
            _this.palletesContainer.innerHTML = markup;

            // Add event listers to the "Add colour" buttons
            for( var i = 0; i < _this.newColourButton.length; i++ ){
                _this.newColourButton[i].addEventListener('click', function(){
                    var palette = this.dataset.pallete;
                    console.log("add new colour to " + palette);
                    _this.addNewOpen(palette);
                });
            }

            // Add event listers to the "Edit pallete" buttons
            for( var i = 0; i < _this.editPalleteButton.length; i++ ){
                _this.editPalleteButton[i].addEventListener('click', function(){
                    var palette = this.dataset.pallete;
                    console.log("Editing " + palette);
                    _this.editPalette(palette);
                });
            }
        },

        addNewOpen: function(palette){
            console.log("Adding colour to the " + palette + " palette.");
            var _this = this;

            //
            // open the colour picker
            _this.newColorPicker.classList.remove('colourpicker__new--hidden');
            // set initial colour
            colourGradientSelect.updatePreview('white');

            //
            // Get the picker value on submit
            _this.saveButton.addEventListener('click', function() {
                console.log("submitting to " + palette);
                _this.addNewSave(palette);
            }, false);

            _this.cancelButton.addEventListener('click', function() {
                _this.newColorPicker.classList.add('colourpicker__new--hidden');
            }, false);

        },

        addNewSave: function(palette){
            var newColour = colourGradientSelect.respond();
            console.log("saving to " + palette);
            // console.log(palette);

            // Loop through the usercolours array untill we find the palette we need to add to
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
            document.querySelectorAll("input[value="+ newColour +"]")[0].checked = true;


            // remove the event listener so we can use it again next time without adding this colour agains
            removeEventListener(this.saveButton);

            //
            // Close the colour picker
            this.newColorPicker.classList.add('colourpicker__new--hidden');

        },

        editPalette: function(palette){

            var _this = this;

            // Add "editing" CSS
            var paletteToEdit = document.querySelectorAll(".palette[data-palette=" + palette + "]")[0];
            paletteToEdit.classList.add('palette--editing');

            // When a colour is selected remove is from the userColours array
            var colours = paletteToEdit.querySelectorAll(".swatch");
            for( var i = 0; i < colours.length; i++ ){
                colours[i].addEventListener("click", deleteThisColour);
            }
            function deleteThisColour(){

                console.log("deleting");

                var colorToDelete = this.dataset.colour;

                // Loop through the usercolours array untill we find the palette we need to edit
                for( var j = 0; j < userColours.length; j++ ){
                    if( userColours[j].name == palette ){

                        // Remove the selected colours from the array
                        var paletteArray = userColours[j].colours;
                        var index = paletteArray.indexOf(colorToDelete);
                        if(index != -1) {
                            paletteArray.splice(index, 1);
                        }
                        break;
                    }
                }

                this.removeEventListener("click", deleteThisColour);

                // Refresh the colours list
                _this.populate();

                paletteToEdit.classList.remove('palette--editing');
            }

            // Handle toggling of the "edit" button
            // this.addEventListener("click", function(){
            //     paletteToEdit.classList.remove('palette--editing');
            // });


        },

    };


    var init = function(element){

        //
        // Initial setup

        // Create a new image
        var imageObj = new Image();
        // Once its loaded, init the colour picker in it
        imageObj.onload = function() {
            colourGradientSelect.init(this);
        };
        // And then set its src so it looks like a colour picker...
        imageObj.src = 'gradient.png';

        // Populate the palletes lists
        colourPalletes.populate();


        // Set the 'current' state on the current colour swatch
        var currentColour = element.dataset.currentColor;
        var currentColourSwatch = document.querySelectorAll('input[value="'+currentColour+'"]')[0];
        currentColourSwatch.checked = true;

        // Display the picker
        var colourPickerEl = document.getElementById('js-colourpicker');
        colourPickerEl.classList.add('colourpicker--open');

        // Handle saving
        var saveButton = document.getElementById('js-colour-confirm');
        saveButton.addEventListener('click', function(){
            // get the selected colour
            var selectedColour = document.querySelector('input[name="colours"]:checked').value;

            // update the preview / swatch element
            element.dataset.currentColor = selectedColour;
            element.style.background = selectedColour;

            // close the picker
            colourPickerEl.classList.remove('colourpicker--open');
            removeEventListener(this);
            // return selectedColour;

            // Callback
            if(typeof callback == 'function') {
                callback(selectedColour);
            }
        });
    };

    init(element);

}
