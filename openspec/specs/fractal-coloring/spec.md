# fractal-coloring Specification

## Purpose

Defines that the color of each zone represents its escape step —it is not decoration— and the way the child paints zones with a simple click, without a color picker.

## Requirements

### Requirement: Color represents the escape step

The system SHALL assign the color of each zone according to the iteration number at which the points of that zone escape the formula.

#### Scenario: Zone colored by its step
- **WHEN** a set of points escapes at the same step `n`
- **THEN** those points share the same color, determined by `n`

### Requirement: One zone is one step

The system SHALL treat each escape step as an independent, paintable zone; zones of high steps can be very thin and only become comfortable to manipulate after zooming.

#### Scenario: Thin zones
- **WHEN** a zone corresponds to a step whose on-screen width is a few pixels
- **THEN** it is still an independent zone and can be reached by zooming

### Requirement: Default color as a gradient

On opening, and for every zone without a custom color, the system SHALL color the fractal with a smooth gradient that varies continuously with the escape step.

#### Scenario: Initial appearance
- **WHEN** the application opens
- **THEN** the fractal is shown with a smooth gradient, with no custom colors

### Requirement: Painting a zone with a click

The system SHALL assign a new color to the zone under the cursor when the child clicks on it, without showing any color picker, while the step-by-step section is not active.

#### Scenario: Painting a band
- **WHEN** the child clicks on a band while the step-by-step section is not active
- **THEN** that band changes color immediately

#### Scenario: Painting disabled during step-by-step
- **WHEN** the child clicks on the fractal while the step-by-step section is active
- **THEN** no zone changes color

### Requirement: Automatic choice of a contrasting color

When painting a zone, the system SHALL choose a color that contrasts with the neighboring bands and that is not in use among the visible bands; if no colors remain available, it SHALL choose the one with the greatest contrast with the neighbors.

#### Scenario: Color different from the neighbors
- **WHEN** the child paints a band whose neighbors have certain colors
- **THEN** the assigned color differs from the color of those neighbors

#### Scenario: Color not repeated among the visible
- **WHEN** there are unused colors among the visible bands
- **THEN** the assigned color is one of those unused colors

### Requirement: Painting is instantaneous

Painting a zone SHALL only change its color and SHALL NOT recompute the traversal of the formula.

#### Scenario: Immediate response
- **WHEN** the child paints a band
- **THEN** the color change appears without a new computation of the iterations

### Requirement: Repeated click cycles the color

Clicking repeatedly on the same zone SHALL advance to the next candidate colors.

#### Scenario: Several clicks on the same band
- **WHEN** the child clicks several times on the same band
- **THEN** the color of that band changes on each click

### Requirement: Colors follow the step number

Custom colors SHALL remain associated with their escape step number, so that they are preserved when zooming and when changing the formula, following the mathematics even as the shape transforms.

#### Scenario: Persistence across zoom
- **WHEN** the child zooms over a previously painted zone
- **THEN** that zone keeps the color assigned to it

#### Scenario: Persistence across formula change
- **WHEN** the child changes the shape of the formula
- **THEN** the custom colors remain associated with their step numbers in the new shape

### Requirement: Clear colors

The system SHALL offer a control that discards all custom colors and restores the default gradient.

#### Scenario: Restoring the gradient
- **WHEN** the child activates the clear-colors control
- **THEN** all zones return to the default gradient

### Requirement: The interior is a paintable zone

The interior region, made of the points that never escape, SHALL be a paintable zone like any other.

#### Scenario: Painting the interior
- **WHEN** the child clicks inside the set
- **THEN** the interior region changes color
