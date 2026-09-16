## Purpose

Allows the child to choose and modify the mathematical rule that generates the fractal, and to explore the Mandelbrot and Julia families, which share one formula but differ in the role of `c`.

## ADDED Requirements

### Requirement: Formula shape selection

The system SHALL offer a set of selectable formula shapes —`z^2`, `z^3`, `z^4`, `|z|^2`, and `conj(z^2)`— and each shape SHALL produce a visually distinct fractal. The initial shape SHALL be `z^2` (classic Mandelbrot).

#### Scenario: Choosing a different shape
- **WHEN** the child selects a shape other than the current one
- **THEN** the fractal image is regenerated according to the new rule

#### Scenario: Initial shape
- **WHEN** the application opens
- **THEN** the active shape is `z^2`

### Requirement: Rule iteration

For every point of the complex plane, the system SHALL repeatedly apply the rule `z <- f(z) + c` and determine whether the point escapes and at which iteration number it does so, within a maximum number of iterations.

#### Scenario: Escaping point
- **WHEN** a point exceeds the escape threshold at iteration `n`
- **THEN** the system associates iteration number `n` with that point

#### Scenario: Non-escaping point
- **WHEN** a point does not exceed the escape threshold before the maximum number of iterations
- **THEN** the system marks that point as belonging to the interior

### Requirement: Mandelbrot mode

In Mandelbrot mode, the system SHALL use the evaluated point as the value of `c` and SHALL start the iteration from `z = 0`.

#### Scenario: Evaluation in Mandelbrot mode
- **WHEN** the application is in Mandelbrot mode
- **THEN** every image point is evaluated with `c` equal to that point and initial `z` equal to 0

### Requirement: Julia mode

In Julia mode, the system SHALL use a fixed seed as the value of `c` and SHALL start the iteration from the evaluated point.

#### Scenario: Evaluation in Julia mode
- **WHEN** the application is in Julia mode with a given seed
- **THEN** every image point is evaluated with `c` equal to the seed and initial `z` equal to that point

### Requirement: Diving from the Mandelbrot to a Julia set

In Mandelbrot mode, the child SHALL be able to open the Julia set corresponding to a chosen point, and that point SHALL become the seed `c` of Julia mode.

#### Scenario: Opening a point's Julia set
- **WHEN** the child chooses a point of the Mandelbrot and asks to open its Julia set
- **THEN** the application switches to Julia mode using that point as the seed `c`

### Requirement: Mini-map for moving the Julia seed

In Julia mode, the system SHALL show a mini-map of the Mandelbrot set indicating the current seed, and the child SHALL be able to move that seed so the Julia set updates live.

#### Scenario: Moving the seed
- **WHEN** the child drags the seed over the mini-map
- **THEN** the displayed Julia set is recomputed for the new seed

#### Scenario: Seed indicator
- **WHEN** the application is in Julia mode
- **THEN** the mini-map shows the position of the current seed
