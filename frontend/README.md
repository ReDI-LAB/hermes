## Frontend

## Tech Stack
- React
- Vite
- TypeScript
- Tailwind CSS


### Core User Flow

Category
→ Product
→ Maximum Price
→ Filter
→ Vendor Results
→ Sort

### Main Components

- FilterPanel
- CategorySelect
- ProductSelect
- PriceCapControl
- SortControl
- VendorList
- VendorCard

### MVP Behaviour

Users select one product/service and define a maximum price.
The application filters available offerings and displays vendors whose
price is within the selected budget.

The initial frontend uses placeholder data while the final client
dataset/API contract is being prepared.

### UI States

- Loading
- Results
- Empty results
- Error
- Validation

### Accessibility

Interactive controls should have clear labels, visible focus states
and keyboard support. The maximum-price control should expose its
current value and range to assistive technologies.

### Setup
npm install

### Development
npm run dev

