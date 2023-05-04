# GrdToAfpalette

Convert Adobe suite .grd gradient files to Affinity suite .afpalette files.

Although the Affinity suite can import Adobe .ase palettes already, gradients are not supported in .ase files.

The conversion is performed entirely in client-side Javascript. No files are uploaded to a server.

# Limitations

Transparency it not supported yet. Adobe gradients have a separate track for transparency stops independent from the colours. This isn't something you can do in an Affinity gradient. However, it should be possible to import transpareny information if the transparency stops line up exactly with the colour stops. This is something I'm going to look into in the future.

Only RGB gradients are supported. Both Adobe and Affinity gradients support many different colourspaces: HSV, CMYK, etc. Supporting them all is a bunch of work, and most of the gradients I've found are RGB.

# The .afpalete format

The Affinity palette format is a standard chunk-based format with a header and footer, but there are still a lot of unknowns, and a few unexpected features. It took a few days diffing around with [ImHex](https://github.com/WerWolv/ImHex) to make a file than Affinity Designer would load. Most of the time you get an "Invalid File Format" error, but if you try really hard you can crash the whole thing. For example, importing a gradient that doesn't have a colour stop a 1.0! Adobe gradients support that, they just continue the last colour stop until the end of the gradient. Affinity Desiger displays garbage and then crashes after a few seconds. I apologise to the Affinity devs for probably sending quite a few automated crash reports to them!

One of the other weirdnesses I discovered is that if colours that appear more than once in the palette file they are replaced with a reference to the first instance of the colour. I don't support that, I just duplicate the colours as it was a lot easier, and Affinity Designer doesn't mind.

# The code

The .grd file loader not exactly elegant. It ignores a lot of the file and just picks out the block names it need. The format is documented, but you don't really need to parse out every little bit of data to get the essential information from a gradient (colours, colour stop location and midpoint), and I don't have infinite time.

After parsing the .grd the code puts the information into a super-simple JSON intermediate format before passing it to the Affinity writer. The idea is that the .grd loader and .afpalette write are independent from each other. Anyone wanting to re-use the code could convert other gradient types to .afpalette, or use the .grd loader and output to another format.

There is a very basic .afpalette reader in the code that does nothing other than parse a .afpalette file and dump its findings to console.log. This was useful when reverse-engineering the format, but isn't used in the converter.

# Useful links

[Description of .grd chunks](http://www.selapa.net/swatches/gradients/fileformats.php)
[.grd file format description](https://github.com/tonton-pixel/json-photoshop-scripting/tree/master/Documentation/Photoshop-Gradients-File-Format#descriptor)
[Official Adobe file formats](https://www.adobe.com/devnet-apps/photoshop/fileformatashtml/#50577411_pgfId-1059252)