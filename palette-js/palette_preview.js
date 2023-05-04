
let globalPaletteData;

const previewElement = document.getElementById("palette_preview");
const previewNameElement = document.getElementById("palette_preview_name");
const downloadElement = document.getElementById("download_card");
const uploadElement = document.getElementById("upload_card");

function previewPalette(paletteData) {


    previewElement.textContent = '';

    for(let i=0 ; i < paletteData.Palettes.length; i++) {

        const gradientElement = document.createElement("div");
        gradientElement.classList.add("col-1");
        gradientElement.classList.add("gradient-preview");

        let linearGradientString = 'linear-gradient(-45deg,';

        for(let j=0 ; j < paletteData.Palettes[i].Colours.length; j++) {

            linearGradientString += 'rgba(' + (paletteData.Palettes[i].Colours[j].Red * 255).toFixed() + ',' +
                                              (paletteData.Palettes[i].Colours[j].Green * 255).toFixed() + ',' +
                                              (paletteData.Palettes[i].Colours[j].Blue * 255).toFixed() + ',' +
                                              (paletteData.Palettes[i].Colours[j].Alpha).toFixed(3) + ') ' +
                                              Math.trunc(paletteData.Palettes[i].Colours[j].Position * 100) + '%, ';
        }

        // Remove last comma
        linearGradientString = linearGradientString.slice(0, -2);
        linearGradientString += ')'

        previewElement.insertBefore(gradientElement, previewElement.firstChild);
        gradientElement.style.setProperty("background", linearGradientString);
    }

    globalPaletteData = paletteData;

    uploadElement.style.display = 'none';
    downloadElement.style.display = 'block';

    previewNameElement.textContent = paletteData.Name;
}

function downloadPreviewedPalette() {
    writeAffinityPalette(globalPaletteData);
}

function convertAnotherPalette() {
    uploadElement.style.display = 'block';
    downloadElement.style.display = 'none';
}
