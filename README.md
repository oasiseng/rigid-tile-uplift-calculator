# Rigid Tile Uplift Calculator 🏠

A standalone wind engineering calculator for tile roof uplift moment in Florida's High Velocity Hurricane Zone (HVHZ), using:

**FBC 2023 Section 1609.6.3 — Equation 16-18**

\[
M_a = q_h \cdot GC_p \cdot C_L \cdot K_d \cdot b \cdot L \cdot L_a
\]

## Features

- Calculates uplift moment (Ma) based on site-specific wind speed, exposure, and tile geometry
- Supports optional override of GCp and Kd
- Auto-converts tile dimensions from inches to feet
- GCp defaults by roof zone (1, 2, 3)
- Velocity pressure (qₕ) calculated per ASCE 7-22 Eq. 26.10-1:
  \[
  q_h = 0.00256 \cdot K_z \cdot K_{zt} \cdot K_e \cdot V^2
  \]

## Usage

1. Clone the repo
2. Install dependencies
3. Run with `npm start`
4. Enter wind parameters and tile data
5. Get PASS/FAIL based on provided resistance (Mf)

## License

MIT — free for residential engineering use, please cite WindCalculations.com
