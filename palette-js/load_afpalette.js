var afpaletteFileInput = document.getElementById('AFFile');
var afpaletteReader = new FileReader();

afpaletteReader.onload = function (e) {

    let byteIndex = 0;
    let dataView;

    const c_Magic = 0x414BFF00;
    const c_Version = 11;
    const c_P1CN = 0x506C434E;  // File name
    const c_PaNV = 0x50614E56;  // Name list
    const c_PaLV = 0x50616C56;  // Palette list
    const c_Cols = 0x436F6C73;  // Colour list
    const c_colD = 0x636F6C44;  // Colour
    const c_Posn = 0x506F736E;  // Position

    dataView = new DataView(e.target.result);

    const magicNumber = dataView.getUint32(byteIndex, true); byteIndex += 4;

    if (magicNumber !== c_Magic) {
        console.log("Bad Magic");
        return;
    }

    const fileVersion = dataView.getUint32(byteIndex, true); byteIndex += 4;

    if(fileVersion != c_Version) {
        console.log("Bad Version");
        return;
    }

    for (let i=byteIndex; i < dataView.byteLength-4; i++) {

        i = AFSkipToChunk(dataView, i, c_P1CN);
        if(i < dataView.byteLength) {

            // Filename
            const fileNameInfo = AFReadUtf8String(dataView, i);
            console.log("Found '" + fileNameInfo.text + "'");
            i = fileNameInfo.newIndex;

            // Palettes
            i = AFSkipToChunk(dataView, i, c_PaLV);
            const paletteCount = dataView.getUint32(i, true); i += 4;
            console.log("Found " + paletteCount + " palettes");

            for(let j=0; j < paletteCount; j++) {

                i = AFSkipToChunk(dataView, i, c_Posn);
                const positionCount = dataView.getUint32(i, true); i += 4;
                console.log("  Found " + positionCount + " positions");

                for(let k=0; k < positionCount; k++) {
                    const position = dataView.getFloat64(i, true); i += 8;
                    const midpoint = dataView.getFloat64(i, true); i += 8;
                    console.log("  Pos:" + position + " Mod:" + midpoint);
                }

                i = AFSkipToChunk(dataView, i, c_Cols);
                const colourCount = dataView.getUint32(i, true); i += 4;

                console.log("  Found " + colourCount + " colours:");

                for(let k=0; k < colourCount; k++) {
                    i = AFSkipToChunk(dataView, i, c_colD); i++;   // skip '_'

                    const red = dataView.getFloat32(i, true); i += 4;
                    const green = dataView.getFloat32(i, true); i += 4;
                    const blue = dataView.getFloat32(i, true); i += 4;
                    const alpha = dataView.getFloat32(i, true); i += 4;

                    console.log("        R:" + red + " G:" + green + " B:" + blue + " A:" + alpha);
                }
            }

            // Names
            i = AFSkipToChunk(dataView, i, c_PaNV); i += 4;
            const nameCount = dataView.getUint32(i, true); i += 4;

            console.log("  Found " + nameCount + " names");

            for(let j=0; j < nameCount; j++) {
                const nameInfo = AFReadUtf8String(dataView, i);
                console.log("Found '" + nameInfo.text + "'");
                i = nameInfo.newIndex;
            }
        }
    }
}

function AFSkipToChunk(dataView, current, val) {
    for (let i=current; i < dataView.byteLength-4; i++) {
        if (dataView.getUint32(i, true) == val) {
            return i + 4;
        }
    }

    return dataView.byteLength;
}

function AFReadUtf8String(dataView, current) {
    const characterCount = dataView.getUint32(current, true); current += 4;
    let s = "";
    for(let i=0; i < characterCount; i++) {
        const utf8 = dataView.getUint8(current); current += 1;
        if(utf8 == 0) {
            break;
        } else {
            s +=  String.fromCharCode(utf8);
        }
    }

    return { text: s, newIndex: current };
}

if(afpaletteFileInput) {
    afpaletteFileInput.onchange = function (e) {
        var file = this.files[0];
        afpaletteReader.readAsArrayBuffer(file);
    }
}