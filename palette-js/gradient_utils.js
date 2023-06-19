var gradientUtils = new function() {

    this.getColourFromGradient = function(gradient, t)
    {
        // Find the two colours that contain 't'
        let colourA;
        let colourB;

        for(let i=0 ; i < gradient.length; i++)
        {
            if(gradient[i].Position == t)
            {
                return gradient[i];
            }
            else if(t < gradient[i].Position)
            {
                colourB = gradient[i];
                colourA = gradient[i-1];

                // Re-normalise t based around the two colours we will be interpolating across.
                const positionRange = 1.0 / (colourB.Position - colourA.Position);
                const newT = (t - colourA.Position) * positionRange;

                return { Red:lerpWithMidpoint(colourA.Red, colourB.Red, colourB.Midpoint, newT),
                         Green:lerpWithMidpoint(colourA.Green, colourB.Green, colourB.Midpoint, newT),
                         Blue:lerpWithMidpoint(colourA.Blue, colourB.Blue, colourB.Midpoint, newT),
                         Alpha:lerpWithMidpoint(colourA.Alpha, colourB.Alpha, colourB.Midpoint, newT) };
            }
        }
    }

    var lerp = function(a, b, t)
    {
        return a * (1-t) + b * t;
    }

    var lerpWithMidpoint = function(a, b, midpoint, t)
    {
        const midValue = lerp(a,b,0.5);

        if (t < midpoint)
        {
            const newT = t / midpoint;
            return lerp(a, midValue, newT);
        }
        else
        {
            const newT = t * (t - midpoint) / (1 - midpoint);
            return lerp(midValue, b, newT);
        }
    }

    var gammaLerp = function(a, b, t, gamma)
    {
        // Scale the input to perceptually linear brightness
        // assuming a and b are in srgb space
        const aG = Math.pow(a, gamma);
        const bG = Math.pow(b, gamma);

        // Mix the colours in linear space
        const linearMix = lerp(aG, bG, t);

        // Scale the mixed value back to sRGB space
        return Math.pow(linearMix, 1.0 / gamma);
    }

    var inverseLerp = function(a, b, t)
    {
        return (t - a) * (1.0 / (b - a));
    }
};