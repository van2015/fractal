# fractal-navigation Specification

## Purpose

Allows the child to explore the fractal at different scales and positions, revealing new detail as they zoom in, without having to manage technical parameters such as the maximum number of iterations.

## Requirements

### Requirement: Zoom toward the cursor

The system SHALL zoom in and out when the mouse wheel is turned, keeping the same point of the complex plane under the cursor during the zoom.

#### Scenario: Zooming in
- **WHEN** the child turns the wheel forward with the cursor over a point of the image
- **THEN** the image zooms in and the point under the cursor stays under the cursor

#### Scenario: Zooming out
- **WHEN** the child turns the wheel backward
- **THEN** the image zooms out while keeping the point under the cursor

### Requirement: Panning

The system SHALL allow the view to be moved by dragging with the mouse, without changing the zoom level.

#### Scenario: Moving the view
- **WHEN** the child holds the mouse down and drags it over the canvas
- **THEN** the image moves following the motion and the zoom level does not change

### Requirement: Distinguishing drag from click

The system SHALL distinguish a drag from a click, so that moving the view does not trigger the painting action.

#### Scenario: Dragging does not paint
- **WHEN** the child drags the mouse more than a minimum distance and then releases it
- **THEN** the view moves and no band is painted

#### Scenario: Click without motion paints
- **WHEN** the child presses and releases the mouse without moving it
- **THEN** the action is a click and not a pan

### Requirement: Auto-scaling maximum iterations

The system SHALL automatically increase the maximum number of iterations as the zoom grows, to preserve detail and prevent the interior from growing as a flat blob. The child SHALL NOT manage this value manually.

#### Scenario: More detail when zooming in
- **WHEN** the child zooms to a larger scale
- **THEN** the maximum number of iterations used is greater than at the previous scale

### Requirement: Progressive rendering

The system SHALL draw a low-resolution version during zoom and pan, and SHALL refine the image up to full resolution when the interaction stops.

#### Scenario: Refinement on stopping
- **WHEN** the child finishes zooming or dragging
- **THEN** the image is progressively refined up to its full resolution

### Requirement: Known zoom level

The system SHALL know and be able to expose the current zoom factor relative to the initial view.

#### Scenario: Querying the zoom
- **WHEN** the child has zoomed to a given scale
- **THEN** the system can report the zoom factor corresponding to that scale
