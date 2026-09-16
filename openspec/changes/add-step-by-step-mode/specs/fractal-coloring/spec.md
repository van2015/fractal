## MODIFIED Requirements

### Requirement: Painting a zone with a click

The system SHALL assign a new color to the zone under the cursor when the child clicks on it, without showing any color picker, while the step-by-step section is not active.

#### Scenario: Painting a band
- **WHEN** the child clicks on a band while the step-by-step section is not active
- **THEN** that band changes color immediately

#### Scenario: Painting disabled during step-by-step
- **WHEN** the child clicks on the fractal while the step-by-step section is active
- **THEN** no zone changes color
