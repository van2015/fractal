## Purpose

Makes the fractal's computation process visible, revealing by iterations the zones that escape as the child advances with a button, and reusing the current formula and view.

## ADDED Requirements

### Requirement: Section activation and deactivation

The system SHALL offer a way to activate and deactivate a step-by-step drawing section that reuses the current formula and view.

#### Scenario: Activating the section
- **WHEN** the child activates the step-by-step section
- **THEN** the fractal is shown in iteration-reveal mode using the formula and view already set

#### Scenario: Deactivating the section
- **WHEN** the child deactivates the step-by-step section
- **THEN** the fractal is shown complete again, as before activating it

### Requirement: Initial depth

When the section is activated, the reveal depth SHALL start at 0.

#### Scenario: First frame
- **WHEN** the child activates the step-by-step section
- **THEN** only the zones that escape at step 0 are revealed and the rest are shown in the neutral color

### Requirement: Reveal by iteration depth

The system SHALL reveal a zone when its escape step is less than or equal to the current depth, and SHALL show unrevealed zones in a neutral color distinct from the palette colors.

#### Scenario: A zone is revealed when its step is reached
- **WHEN** the current depth is greater than or equal to a zone's escape step
- **THEN** that zone is shown with its normal escape-step color

#### Scenario: Zone not yet revealed
- **WHEN** a zone's escape step is greater than the current depth
- **THEN** that zone is shown in the neutral color, not with its palette color

### Requirement: Advancing with the next button

The system SHALL offer a "next" button that increases the depth by one iteration and reveals the zones that escape at that step.

#### Scenario: Advancing one iteration
- **WHEN** the child presses "next"
- **THEN** the depth increases by 1 and the zones that escape at the new step start showing their normal color

### Requirement: Depth indicator

The interface SHALL show the current reveal depth.

#### Scenario: Seeing the depth
- **WHEN** the child advances or resets the section
- **THEN** the indicator reflects the current depth

### Requirement: Full reveal at the maximum

When the depth reaches the maximum number of iterations, the system SHALL reveal the whole fractal, including the interior region made of points that never escape.

#### Scenario: Everything revealed
- **WHEN** the depth reaches the maximum number of iterations
- **THEN** all zones and the interior region are shown with their normal colors

### Requirement: Resetting the reveal

The system SHALL offer a reset control that returns the depth to 0.

#### Scenario: Resetting
- **WHEN** the child presses the reset control
- **THEN** the depth returns to 0 and only the step-0 zones remain revealed

### Requirement: Depth persists across view or formula changes

The depth SHALL persist across zooming, panning, and changing the formula, and SHALL be clamped to the current maximum number of iterations when that maximum is smaller than the current depth.

#### Scenario: Preserving depth across zoom
- **WHEN** the child zooms or pans with the section active
- **THEN** the reveal depth does not change

#### Scenario: Clamping depth when the maximum drops
- **WHEN** the current maximum number of iterations becomes smaller than the current depth
- **THEN** the depth is clamped to the new maximum

### Requirement: Navigation available with the section active

Zoom and pan SHALL remain available while the step-by-step section is active.

#### Scenario: Zooming with the section active
- **WHEN** the child turns the mouse wheel with the section active
- **THEN** the view zooms and the reveal is applied to the new view while preserving the depth
