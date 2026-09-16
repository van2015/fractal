## Purpose

Defines the screen, the minimal controls, and the initial state of the application, prioritizing that the fractal is the protagonist and that a 6-to-8-year-old child can use it without instructions.

## ADDED Requirements

### Requirement: Initial state

On opening, the application SHALL show the classic Mandelbrot with the `z^2` shape, the default gradient, and the initial view centered on the set.

#### Scenario: First contact
- **WHEN** the child opens the application
- **THEN** they see the classic Mandelbrot colored with the default gradient, with no prior steps

### Requirement: Full-screen canvas

The fractal SHALL occupy most of the screen and the controls SHALL be minimal and large, suitable for 6-to-8-year-old children.

#### Scenario: Fractal takes center stage
- **WHEN** the application is in use
- **THEN** the fractal occupies most of the visible area and the controls do not cover it

### Requirement: Shape selector

The interface SHALL offer a selector to choose among the available formula shapes, presented in a visual way accessible to the child.

#### Scenario: Changing shape from the interface
- **WHEN** the child taps one of the shapes in the selector
- **THEN** the application switches to using that shape

### Requirement: Formula and zoom indicator

The interface SHALL show the current formula and the zoom level in an easy-to-read HUD.

#### Scenario: Seeing the formula and the zoom
- **WHEN** the child changes shape or zooms
- **THEN** the HUD reflects the current formula and the updated zoom level

### Requirement: Escape-step inspection mode

The interface SHALL offer a control that enables inspection, so that hovering the cursor over a band shows the escape step number of that zone. Inspection SHALL be disabled by default.

#### Scenario: Inspection disabled
- **WHEN** the child has not enabled inspection
- **THEN** hovering the cursor over the fractal shows no number

#### Scenario: Inspection enabled
- **WHEN** the child enables inspection and hovers the cursor over a band
- **THEN** the interface shows the escape step of that band

### Requirement: Access to Julia mode

The interface SHALL offer a way to enter Julia mode from the Mandelbrot and to return to the Mandelbrot.

#### Scenario: Entering and leaving Julia mode
- **WHEN** the child enters Julia mode and then goes back
- **THEN** the application alternates between both modes while keeping a valid view in each one

### Requirement: No persistence

The application SHALL NOT save, export, or share state: when closed, the session is lost.

#### Scenario: No saving
- **WHEN** the child looks for a way to save or export their exploration
- **THEN** the interface offers none
