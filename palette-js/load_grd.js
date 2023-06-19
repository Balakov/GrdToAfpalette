var grdFileInput = document.getElementById('GRDfile');
var grdReader = new FileReader();

const errorElement = document.getElementById("errors");

grdReader.onload = function (e) {

    clearErrors();

    let byteIndex = 0;
    let dataView;

    const c_8BGR = 0x38424752;  // '8BGR'
    const c_Clrs = 0x436c7273;  // 'Clrs'
    const c_Rd   = 0x52642020;  // 'Rd  '
    const c_Grn  = 0x47726E20;  // 'Grn '
    const c_Bl   = 0x426C2020;  // 'Bl  '
    const c_Lctn = 0x4C63746E;
    const c_Mdpn = 0x4D64706E;
    const c_Grdn = 0x4772646E;
    const c_Nm   = 0x4E6D2020;
    const c_Trns = 0x54726E73;
    const c_TrnS = 0x54726E53;
    const c_Opct = 0x4F706374;

    var filename = grdFileInput.files[0].name;
    const fileExtensionIndex = filename.lastIndexOf(".");
    const filenameWithoutExtension = filename.substr(0, fileExtensionIndex < 0 ? filename.length : fileExtensionIndex);

    grdFileInput.value = '';    // Reset this as onchange only fires if the value is different.

    console.log("Loading file '" + filenameWithoutExtension + "'");

    dataView = new DataView(e.target.result);

    const magicNumber = dataView.getUint32(byteIndex, false); byteIndex += 4;

    if (magicNumber != c_8BGR) {
        showError("Sorry, I am not able to recognize this format.");
        console.log("Bad Magic. Got 0x" + magicNumber.toString(16));
        return;
    }

    const fileVersion = dataView.getUint16(byteIndex, false); byteIndex += 2;

    if(fileVersion != 5) {
        if(fileVersion == 3) {
            showError("Please use gradient files from Photoshop 6 or above as they are the only ones I can support at the moment. Thank you!");
        } else {
            showError("It looks like I'm not able to support this particular file version at the moment.");
        }

        console.log("Bad Version. Got " + fileVersion);
        return;
    }

    const descriptorMagic = dataView.getUint32(byteIndex, false); byteIndex += 4;
    if(descriptorMagic != 16) {
        showError("Sorry, I am not able to recognize this format.");
        return;
    }

    const palettes = {
        Name: filenameWithoutExtension,
        Palettes: []
    };

    for (let i=byteIndex; i < dataView.byteLength-4; i++) {
        i = GRDSkipToChunk(dataView, i, c_Grdn);
        if(i < dataView.byteLength) {
            i = GRDSkipToChunk(dataView, i, c_Nm); i += 4;   // Skip 'TEXT'

            const nameInfo = GRDReadUnicodeString(dataView, i);

            // Debug
            nameInfo.text += "(" + (palettes.Palettes.length + 1) + ")";

            console.log("Found '" + nameInfo.text + "'");
            i = nameInfo.newIndex;

            const palette = {
                Name: nameInfo.text,
                Colours: []
            };

            palettes.Palettes.push(palette);

            const colourTrack = [];
            const transparencyTrack = [];
            const positionsTrack = [];

            i = GRDSkipToChunk(dataView, i, c_Clrs); i += 4; // Skip VILs

            colourCount = dataView.getUint32(i, false);
            console.log("    Found Clrs with " + colourCount + " stops");

            for(let j=0; j < colourCount; j++) {
                i = GRDSkipToChunk(dataView, i, c_Rd); i += 4; // Skip type

                if (i >= dataView.byteLength) {
                    showError("Sorry, I only support converting RGB gradients.");
                }

                const red = dataView.getFloat64(i, false) / 255.0;
                i = GRDSkipToChunk(dataView, i, c_Grn); i += 4; // Skip type
                const green = dataView.getFloat64(i, false) / 255.0;
                i = GRDSkipToChunk(dataView, i, c_Bl); i += 4; // Skip type
                const blue = dataView.getFloat64(i, false) / 255.0;
                i = GRDSkipToChunk(dataView, i, c_Lctn); i += 4; // Skip type
                const location = dataView.getUint32(i, false) * (1/4096.0);
                i = GRDSkipToChunk(dataView, i, c_Mdpn); i += 4; // Skip type
                const midpoint = dataView.getUint32(i, false) * 0.01;

                // Make sure we have an entry at location 0
                if(j == 0 && location != 0) {
                    // Duplicate first entry
                    colourTrack.push({Red:red, Green:green, Blue:blue, Alpha:1, Position:0, Midpoint:midpoint });
                    positionsTrack.push({Position:0, Midpoint:midpoint});
                }

                console.log(        "R:" + red + " G:" + green + " B:" + blue + " L:" + location + " M:" + midpoint);

                colourTrack.push({Red:red, Green:green, Blue:blue, Alpha:1, Position:location, Midpoint:midpoint});
                positionsTrack.push({Position:location, Midpoint:midpoint});

                // Make sure we have an entry at 1 otherwise we'll crash Designer
                if(j == colourCount-1 && location != 1) {
                    // Duplicate last entry
                    colourTrack.push({Red:red, Green:green, Blue:blue, Alpha:1, Position:1, Midpoint:midpoint});
                    positionsTrack.push({Position:1, Midpoint:midpoint});
                }
            }

            // Get the transparency stops

            i = GRDSkipToChunk(dataView, i, c_Trns); i += 4; // Skip VILs
            const transparencyCount = dataView.getUint32(i, false);

            console.log("    Found Trns with " + transparencyCount + " stops");

            for(let j=0; j < transparencyCount; j++) {
                i = GRDSkipToChunk(dataView, i, c_TrnS);
                i = GRDSkipToChunk(dataView, i, c_Opct); i += 8; // Skip 'UntF' and '#Prc'
                const opacity = dataView.getFloat64(i, false) * 0.01;
                i = GRDSkipToChunk(dataView, i, c_Lctn); i += 4;
                const location = dataView.getUint32(i, false) * (1/4096.0);
                i = GRDSkipToChunk(dataView, i, c_Mdpn); i += 4;
                const midpoint = dataView.getUint32(i, false) * 0.01;

                // Make sure we have an entry at location 0
                if(j == 0 && location != 0) {
                    // Duplicate first entry
                    transparencyTrack.push({Red:0, Green:0, Blue:0, Alpha:opacity, Position:0, Midpoint:midpoint});
                    positionsTrack.push({Position:0, Midpoint:midpoint});
                }

                console.log(        "Opacity:" + opacity + " L:" + location + " M:" + midpoint);

                transparencyTrack.push({Red:0, Green:0, Blue:0, Alpha:opacity, Position:location, Midpoint:midpoint});
                positionsTrack.push({Position:location, Midpoint:midpoint});

                // Make sure we have an entry at 1 otherwise we'll crash Designer
                if(j == transparencyCount-1 && location != 1) {
                    // Duplicate last entry
                    transparencyTrack.push({Red:0, Green:0, Blue:0, Alpha:opacity, Position:1, Midpoint:midpoint});
                    positionsTrack.push({Position:1, Midpoint:midpoint});
                }
            }

            positionsTrack.sort(function(a, b){return a.Position - b.Position});

            let lastPosition = -1;

            for(let i=0; i < positionsTrack.length; i++)
            {
                const t = positionsTrack[i].Position;
                const midpoint = positionsTrack[i].Midpoint;

                // Don't duplicate the stops if we have a colour and transparency stop at the same position
                if(t == lastPosition)
                    continue;

                lastPosition = t;

                const colour = gradientUtils.getColourFromGradient(colourTrack, t);
                const transparency = gradientUtils.getColourFromGradient(transparencyTrack, t);

                palette.Colours.push({Red:colour.Red, Green:colour.Green, Blue:colour.Blue, Alpha:transparency.Alpha, Position:t, Midpoint:midpoint });
            }

            // DEBUG - limit the amount of palettes to export
            //if(palettes.Palettes.length == 1)
            //    break;
        }

        console.log("Found " + palettes.Palettes.length + " palettes");
    }

    previewPalette(palettes);
}

function GRDSkipToChunk(dataView, current, val) {

    for (let i=current; i < dataView.byteLength-4; i++) {
        if (dataView.getUint32(i, false) == val) {
            return i + 4;
        }
    }

    return dataView.byteLength;
}

function GRDReadUnicodeString(dataView, current) {
    const characterCount = dataView.getUint32(current, false); current += 4;
    let s = "";
    for(let i=0; i < characterCount; i++) {
        const utf16 = dataView.getUint16(current, false); current += 2;
        if(utf16 == 0) {
            break;
        } else {
            s +=  String.fromCharCode(utf16);
        }
    }

    return { text: s, newIndex: current };
}

function showError(message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function clearErrors() {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
}

grdFileInput.onchange = function (e) {
    var file = this.files[0];
    grdReader.readAsArrayBuffer(file);
}