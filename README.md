# kremerman.me

Personal landing page featuring an animated canvas with neon hexagon-forming particles masked into text.

## How it works

Particles travel in straight lines on an offscreen canvas, turning ±60 degrees after a fixed amount of time. This creates an emergent hexagonal pattern - there is no actual grid. 

The visible effect is the result of pixel accumulation — each frame paints a semi-transparent black overlay instead of clearing the canvas, so past positions gradually fade rather than disappear. The offscreen canvas is then composited onto the main canvas using the page text as a mask, so the animation is only visible through the letterforms.

## Modifications from the original

The animation is based on [neon hexagon-forming particles](https://codepen.io/towc/pen/mJzOWJ) by Matei Copot. Changes include:

- Multiple particle origin points distributed across the text width, instead of a single center point.
- Offscreen canvas rendering with text-mask compositing
- Hexagonal glow effect — when two or more particles from different origins overlap on the same hex cell, "glowing" hexagons are drawn. Again, the glow effect is actually a result of pixel accumulation, not actual animation
- Debug view (press `d`) to see the raw offscreen canvas without text masking
- Doubled canvas render density and retuned animation parameters
- Responsive font sizing and layout

## License

MIT — see [LICENSE](LICENSE) and [particles-LICENSE.txt](sparks-LICENSE.txt).
