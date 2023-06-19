
let globalPaletteData;

const previewElement = document.getElementById("palette_preview");
const previewNameElement = document.getElementById("palette_preview_name");
const downloadElement = document.getElementById("download_card");
const uploadElement = document.getElementById("upload_card");

function previewPalette(paletteData) {

    previewElement.textContent = '';
    const canvasSize = 48;

    for(let i=0 ; i < paletteData.Palettes.length; i++)
    {
        const canvasElement = document.createElement("canvas");
        canvasElement.width = canvasSize;
        canvasElement.height = canvasSize;

        const ctx = canvasElement.getContext("2d");

        // Checkerboard background
        const rowCount = 8;
        const columnCount = 8;
        const w = canvasSize / columnCount;
        const h = canvasSize / rowCount;

        for (let y = 0; y < rowCount; y++)
        {
            for (let x = 0; x < columnCount; x++)
            {
                if ((x % 2 == 0 && y % 2 == 0) || (x % 2 != 0 && y % 2 != 0))
                {
                    ctx.fillStyle = "#a0a0a0";
                }
                else
                {
                    ctx.fillStyle = "#ffffff";
                }

                ctx.fillRect(x * w, y * h, w, h);
            }
        }

        ctx.translate(0.5, 0.5);

        for(let j=0; j < canvasSize; j++)
        {
            const t = j / canvasSize;
            ctx.beginPath();
            ctx.moveTo(0, j);
            ctx.lineTo(canvasSize, j);

            const colour = gradientUtils.getColourFromGradient(paletteData.Palettes[i].Colours, t);
            const colourString = 'rgba(' + (colour.Red * 255.0).toFixed() + ',' + (colour.Green * 255.0).toFixed() + ',' + (colour.Blue * 255.0).toFixed() + ',' + colour.Alpha.toFixed(3) + ')'

            ctx.strokeStyle = colourString;
            ctx.stroke();
        }

        const gradientElement = document.createElement("div");
        gradientElement.classList.add("gradient-preview");
        gradientElement.appendChild(canvasElement);

        //previewElement.insertBefore(gradientElement, previewElement.firstChild);
        previewElement.appendChild(gradientElement, previewElement.firstChild);
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
