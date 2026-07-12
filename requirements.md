
# Software Requirements Specification (SRS) - Coffeeshop POS System

## 1. Global System Architecture & Core Rules

* **Payment Separation Logic**: The system must strictly calculate and separate revenue tracking between **QRIS (Digital)** and **Cash** payment methods across all reporting modules.


* **Role-Based Middleware**: A secure authentication middleware must guard system routing, enforcing a strict boundary between the two primary roles: **Admin** and **Cashier**.

---

## 2. Front-Office Modules (Mobile/Cashier Interface)

### 2.1 Authentication (Login Page)

* **Standard Auth Flow**: Provide a standard user authentication layout accepting a unique **Username** and **Password** combination.


* **Secure Routing**: The login module must communicate with the backend middleware to validate credentials and dynamically route the authenticated session based on the assigned role (Admin or Cashier).



### 2.2 Home - Sales & Catalog Interface

* **UI Alignment**: Build the interface layout in accordance with the pre-established user interface designs.


* **Product Customization Modal**: Triggering/clicking a product card must open a dynamic modal popup window. This modal enables real-time item configuration, such as choosing product variants, modifications, or specific add-ons.



### 2.3 Cashier Shift Management Module

This module operates across three distinct operational phases:

#### A. Pre-Shift Activation Phase

* **Cashier Identity**: The system must explicitly display the full profile name of the currently logged-in cashier.


* **Starting Cash Input**: Provide a mandatory numeric input field for the cashier to declare the exact amount of initial float/drawer capital when opening the store.


* **Action Command**: A "Start Shift" action button to officially begin logging operational hours.



#### B. Active Shift Phase

* **Dynamic Overtime Tracker**: Implement a live duration counter calculating active shift length. If the standard shift limit (e.g., 6 hours) is surpassed, the clock must switch to an overtime tracker format (e.g., showing incrementing overtime as `+30:20` instead of resetting or stopping).


* **Petty Cash Out Logging**: A dedicated input form allowing cashiers to record unexpected cash outflows (e.g., procurement of emergency supplies or operational expenses).


* **Petty Cash In Logging**: A dedicated input form allowing cashiers to record unexpected cash inflows (e.g., additional capital drops deposited by the business owner).


* **Action Command**: An "End Shift" action button to freeze active operations and trigger the reconciliation phase.



#### C. Post-Shift Reconciliation Phase

* **Actual Physical Cash Input**: Provide a manual input field where the cashier enters the final physical money counted directly from the cash drawer.


* **Automated Variance Analytics**: The system must automatically calculate the financial balance variance. The mathematical models for this calculation are defined below:



The expected cash amount is derived as follows:


$$\text{Expected Cash} = \text{Starting Cash} + \text{Total Cash Sales} + \text{Total Cash In} - \text{Total Cash Out}$$

The variance indicator is calculated as:


$$\text{Variance} = \text{Actual Cash} - \text{Expected Cash}$$

* **Balance Indicator**: Render a clear mathematical indicator showcasing whether the drawer status is positive, negative, or perfectly balanced (where a value of 0 indicates an exact match).


* **Action Confirmation**: A "Confirm Shift Closure" button. Executing this command permanently logs the shift data to the database and seamlessly resets the UI state back to the Pre-Shift Activation view.



### 2.4 Sales History Module

* **Data Presentation**: Render a historical ledger of completed store sales, which can be styled as a structured table array or a grid of detailed data cards.


* **Receipt Simulation Engine**: Provide a "Print Receipt" simulator button on each record. This action does not execute a physical print command but instead renders a virtual, formatted document replica summarizing the finalized transaction details.



---

## 3. Back-Office Modules (Admin Dashboard Interface)

### 3.1 Core Executive Dashboard

* **UI Reference**: Design the core interface panels mirroring the predefined administrative layout, leaving room for scalable layout components.



### 3.2 Product Catalog Management (CRUD)

* **Layout & Controls**: A grid of data cards or a clean tabular structure showcasing the core catalog items.


* **Functional Scope**: Full Create, Read, Update, and Delete (CRUD) capability for inventory items.



### 3.3 Raw Ingredients Management (CRUD)

* **Layout & Controls**: A data table tracking base ingredients and bulk stocks.


* **Functional Scope**: Full operational CRUD capabilities for adding, updating, and removing raw ingredients.



### 3.4 Inventory Stock Control (CRUD)

* **Layout & Controls**: A product stock monitoring grid presented via tables or responsive cards.


* **Stock Auditing (Opname)**: Alongside full inventory CRUD actions, embed an explicit "Stock Opname" feature allowing admins to perform manual structural inventory audits.



### 3.5 Supplier Management (CRUD)

* **Layout & Controls**: A dedicated organizational database layout utilizing cards or tables to track B2B vendors.


* **Functional Scope**: Full structural CRUD control over external supplier profiles.



### 3.6 Employee Management (CRUD)

* **Layout & Controls**: An internal staff directory rendered using organized cards or database tables.


* **Functional Scope**: Full CRUD operations for registering, updating, and removing store personnel accounts.



### 3.7 Staff Operational Performance Reports

* **Visual Layout**: Implement a card-based grid system designed specifically for high visual scannability and fast administrative auditing.


* **Mandatory Data Points**: Each aggregated shift card must display:
1. The explicit name of the cashier.


2. Total active working hours/shift duration.


3. The final recorded cash drawer variance indicator value.


4. The combined total sales revenue generated (Sum of Cash + QRIS channels).





### 3.8 Advanced Transaction & Financial Analytics

* **Deep Analytical Visualizations**: Interactive data charts mapping out business metrics across weekly, monthly, and yearly historical timelines.


* **Volume Metrics**: Counter cards reflecting absolute transaction counts tracked daily, weekly, monthly, and annually.


* **Financial Metrics**: Financial blocks tracking Gross Revenue and Net Profit across daily, weekly, monthly, and annual cycles.


* **Data Portability**: An option allowing administrators to export targeted transactional and financial datasets into standard spreadsheet formats.


# Database Schema & Relational Data Blueprint (Text-Descriptive Flow)

This document maps out the entity relationships and data flow for the Coffeeshop POS system. Although implemented on a NoSQL database (MongoDB), data integrity and relational mapping are strictly preserved using document referencing (`Schema.Types.ObjectId`) and strategic embedding.

---

## 1. Data Flow & Entity Relationships

To avoid visual ambiguity, the relational pipeline of the system is defined through the following structural rules:

### 1.1 Procurement & Supply Chain Flow
* **Supplier to Stock (1:N Relation)**: A single `Supplier` profile can be associated with multiple incoming `Stock` ledger entries (supply batches) over time.
* **Stock to Ingredients (N:1 Relation)**: Multiple `Stock` adjustment logs or incoming batches point to one master `Ingredients` record. The system aggregates these ledger entries to calculate and update the real-time available balance (`current_stock`) of that specific ingredient.

### 1.2 Recipe & Menu Formulation Flow
* **Ingredients to Products (N:M Relation via Embedded Schema)**: Master `Ingredients` are linked to `Products` through an embedded `recipe` array inside the product document. A single ingredient can be part of many product recipes, and a single product can require multiple ingredients.
* **Ingredients to Modifiers (N:M Relation via Embedded Schema)**: Similarly, master `Ingredients` are mapped to product customization choices (`Modifiers`) to calculate material depletion when an add-on (e.g., extra shot) is selected.
* **ModifierGroups to Modifiers (1:N Relation)**: A single `ModifierGroup` (e.g. 'Size') owns multiple `Modifier` options (e.g. 'Small', 'Large'). The group defines the selection behavior (single/multiple, required/optional).
* **Products to ModifierGroups (N:M Relation via Reference)**: A `Product` references the `ModifierGroups` that apply to it. The same group can be reused across many products.

### 1.3 Front-Office Transactional Flow
* **Shift to Transactions (1:N Relation)**: An active cashier `Shift` acts as the parent logging context. It encompasses multiple customer `Transactions` completed by that specific cashier during their active operational hours.
* **Shift to CashFlow (1:N Relation)**: A `Shift` owns multiple `CashFlow` entries (petty cash in/out) recorded during the active phase. Their totals feed the closure reconciliation.
* **Transaction to TransactionDetails (1:N Relation)**: Each master `Transaction` contains one or more line-item records within the `TransactionDetails` collection, representing the structural state of the checkout cart.
* **TransactionDetail to Modifiers Selected (1:N Relation)**: Each individual line item in the cart (`TransactionDetail`) can dynamically hold multiple selected customization choices (`Modifiers`), tracking unique customer preferences per item.

---

## 2. Collection Schemas & Fields

### 2.1 Users (Employees / Admins)
```json
{
  "_id": "ObjectId",
  "username": "String (Unique, Indexed)",
  "password_hash": "String (Bcrypt)",
  "name": "String",
  "role": "String (Enum: ['admin', 'cashier'])",
  "is_active": "Boolean",
  "created_at": "Date"
}

```

### 2.2 Shifts

```json
{
  "_id": "ObjectId",
  "cashier_id": "ObjectId (Ref: Users)",
  "starting_cash": "Number (Initial float declared at open)",
  "total_cash_sales": "Number (Sum of successful CASH transactions in this shift; computed at closure)",
  "total_qris_sales": "Number (Sum of successful QRIS transactions; for reporting, not part of drawer variance)",
  "total_cash_in": "Number (Default: 0; aggregate of CashFlow cash_in)",
  "total_cash_out": "Number (Default: 0; aggregate of CashFlow cash_out)",
  "expected_cash": "Number (Calculated at closure = starting_cash + total_cash_sales + total_cash_in - total_cash_out)",
  "actual_cash": "Number (Nullable until closed; physical cash counted by cashier)",
  "variance": "Number (Nullable until closed = actual_cash - expected_cash. 0 = balanced, + = surplus, - = shortage)",
  "start_time": "Date",
  "end_time": "Date (Nullable until closed)",
  "status": "String (Enum: ['active', 'closed'])"
}

```

### 2.3 Suppliers

```json
{
  "_id": "ObjectId",
  "supplier_name": "String",
  "contact_phone": "String",
  "email": "String",
  "address": "String",
  "created_at": "Date"
}

```

### 2.4 Stock (Inventory Ledger / Supply Batches)

```json
{
  "_id": "ObjectId",
  "supplier_id": "ObjectId (Ref: Suppliers, Nullable if manual adjustment)",
  "ingredient_id": "ObjectId (Ref: Ingredients)",
  "quantity_changed": "Number (Positive for incoming supply, negative for damaged/expired goods)",
  "batch_number": "String (Optional)",
  "cost_per_unit": "Number (Price paid to supplier. For sales_deduction/void_return, use the ingredient's last known cost for COGS traceability)",
  "adjustment_type": "String (Enum: ['supply_in', 'damaged', 'expired', 'stock_opname', 'sales_deduction', 'void_return'])",
  "reference_id": "ObjectId (Optional - links back to the Transaction that caused a sales_deduction/void_return)",
  "recorded_by": "ObjectId (Ref: Users)",
  "created_at": "Date"
}

```

### 2.5 Ingredients (Core Available Stock)

```json
{
  "_id": "ObjectId",
  "ingredient_name": "String",
  "sku": "String (Stock Keeping Unit)",
  "current_stock": "Number (Calculated/cached total balance available. Enforced >= 0, never negative)",
  "minimum_stock": "Number (For low-stock alert triggers)",
  "last_cost_per_unit": "Number (Most recent purchase cost per unit; used to compute product COGS / snapshot_cogs)",
  "unit": "String (Enum: ['gr', 'ml', 'pcs'])",
  "is_deleted": "Boolean (Soft delete flag; hidden from UI but preserved for historical integrity)",
  "updated_at": "Date"
}

```

### 2.6 Products

```json
{
  "_id": "ObjectId",
  "product_name": "String",
  "category": "String (Enum: ['coffee', 'non-coffee', 'pastry', 'merchandise'])",
  "price": "Number",
  "image_url": "String",
  "recipe": [
    {
      "ingredient_id": "ObjectId (Ref: Ingredients)",
      "quantity_required": "Number"
    }
  ],
  "modifier_groups": "[ObjectId] (Ref: ModifierGroups - which customization groups apply to this product)",
  "is_available": "Boolean (Manual toggle by admin. NOTE: real stock availability is computed on read, see workflow 3.3)",
  "is_deleted": "Boolean (Soft delete flag)",
  "created_at": "Date"
}

```

### 2.7 ModifierGroups (Customization Group / Option Set)

Defines HOW a set of options behaves when shown in the product customization modal. Handles both
required single-choice variants (e.g. Size, Ice Level) and optional multi-choice add-ons (e.g. Extra Shot).

```json
{
  "_id": "ObjectId",
  "group_name": "String (e.g. 'Ukuran', 'Level Gula', 'Tambahan')",
  "selection_type": "String (Enum: ['single', 'multiple'])",
  "is_required": "Boolean (Must the customer pick at least one?)",
  "max_select": "Number (Max options selectable; for 'single' this is 1)",
  "is_deleted": "Boolean (Soft delete flag)"
}

```

### 2.8 Modifiers (Individual Customization Options)

Each modifier is one selectable option belonging to a ModifierGroup. Keeps its own `recipe` so
material depletion is calculated when the option is chosen (e.g. 'Large' consumes more milk).

```json
{
  "_id": "ObjectId",
  "group_id": "ObjectId (Ref: ModifierGroups - the group this option belongs to)",
  "modifier_name": "String (e.g. 'Large', 'Extra Shot')",
  "extra_price": "Number (0 for a default option; positive to add to base price)",
  "recipe": [
    {
      "ingredient_id": "ObjectId (Ref: Ingredients)",
      "quantity_required": "Number"
    }
  ],
  "is_available": "Boolean (Manual toggle. Real stock availability computed on read, see workflow 3.3)",
  "is_deleted": "Boolean (Soft delete flag)"
}

```

### 2.9 Transactions

```json
{
  "_id": "ObjectId",
  "invoice_number": "String (Unique, human-readable, e.g. 'INV-20260712-001')",
  "shift_id": "ObjectId (Ref: Shifts)",
  "cashier_id": "ObjectId (Ref: Users)",
  "total_amount": "Number",
  "payment_method": "String (Enum: ['cash', 'qris'])",
  "payment_status": "String (Enum: ['pending', 'success', 'failed', 'voided'])",
  "voided_by": "ObjectId (Ref: Users, Nullable - who voided the transaction)",
  "void_reason": "String (Nullable)",
  "voided_at": "Date (Nullable)",
  "created_at": "Date (Indexed)"
}

```

### 2.10 TransactionDetails (Line Items with Snapshot Integrity)

```json
{
  "_id": "ObjectId",
  "transaction_id": "ObjectId (Ref: Transactions)",
  "product_id": "ObjectId (Ref: Products)",
  "snapshot_product_name": "String",
  "snapshot_price": "Number",
  "snapshot_cogs": "Number (Cost of goods for this line at sale time = sum of (ingredient qty x last_cost_per_unit) for the product recipe + all selected modifier recipes, x quantity. Frozen for accurate historical Net Profit)",
  "quantity": "Number",
  "subtotal": "Number",
  "notes": "String",
  "selected_modifiers": [
    {
      "modifier_id": "ObjectId (Ref: Modifiers)",
      "snapshot_modifier_name": "String",
      "snapshot_extra_price": "Number",
      "quantity": "Number"
    }
  ]
}

```

### 2.11 CashFlow (Petty Cash In / Out Ledger)

Records every manual cash movement during a shift (petty cash in/out) with a reason, for audit trails
and shift reconciliation. Each shift's `total_cash_in` / `total_cash_out` are the aggregates of these entries.

```json
{
  "_id": "ObjectId",
  "shift_id": "ObjectId (Ref: Shifts - the shift this movement belongs to)",
  "cashier_id": "ObjectId (Ref: Users - who recorded it)",
  "flow_type": "String (Enum: ['cash_in', 'cash_out'])",
  "amount": "Number (Positive value)",
  "reason": "String (e.g. 'Beli galon air', 'Setoran modal tambahan dari owner')",
  "created_at": "Date"
}

```

---

## 3. Inventory Update Workflows (AI System Rules)

### 3.1 Supply Chain / Incoming Stock Workflow

When a new supply arrives from a **Supplier**:

1. Create a new document in the `Stock` collection declaring the `supplier_id`, targeted `ingredient_id`, `quantity_changed` (positive integer), and `cost_per_unit`.
2. Trigger an internal database hook/function to update the `Ingredients` collection:

$$\text{Ingredients.current\_stock}_{\text{new}} = \text{Ingredients.current\_stock}_{\text{current}} + \text{Stock.quantity\_changed}$$



### 3.2 Sales Consumption Workflow

When a transaction is finalized successfully (`payment_status: "success"`):

1. Read the `recipe` specifications from the purchased `Products` and selected `Modifiers` via `TransactionDetails`.
2. Compute the exact volume deduction from the line item quantities (product recipe + every selected modifier recipe).
3. **Stock guard (mandatory)**: Before deducting, re-validate on the server that every required ingredient has enough balance. Use an atomic conditional update so `current_stock` can NEVER go negative, even under concurrent orders:

```js
Ingredient.updateOne(
  { _id: ingredientId, current_stock: { $gte: amountNeeded } },
  { $inc: { current_stock: -amountNeeded } }
)
// If matchedCount === 0 -> insufficient stock, abort the whole transaction (roll back).
```

4. On success, the resulting balance is:

$$\text{Ingredients.current\_stock}_{\text{new}} = \text{Ingredients.current\_stock}_{\text{current}} - (\text{Quantity Required} \times \text{Transaction Quantity})$$

5. Snapshot the line-item cost into `TransactionDetails.snapshot_cogs` using each ingredient's `last_cost_per_unit`.
6. Generate an automated `Stock` log entry per ingredient with `adjustment_type: "sales_deduction"` (negative `quantity_changed`) and `reference_id` = the transaction id, preserving a unified audit trail.

### 3.3 Product & Modifier Availability Workflow (Computed on Read)

Availability from stock is NOT stored; it is derived every time the catalog/modal is requested:

1. Load all `Ingredients` once into a map keyed by `_id`.
2. A product (or modifier) is `in_stock` only if EVERY ingredient in its `recipe` satisfies `current_stock >= quantity_required` (enough for at least one unit).
3. The UI-facing flag is `available = is_available (manual toggle) AND in_stock (computed)`.
4. When `available === false`, the front-office greys out the card/option with a "Stok Habis" placeholder and blocks selection. This is a display safeguard only — the authoritative anti-negative guard is workflow 3.2 step 3.

### 3.4 Stock Opname (Manual Audit) Workflow

The admin enters the ABSOLUTE physically-counted quantity; the system computes the delta:

1. `delta = counted_quantity - current_stock` (may be positive or negative).
2. Create a `Stock` entry: `quantity_changed = delta`, `adjustment_type = "stock_opname"`, `recorded_by = admin`.
3. Set `Ingredients.current_stock = counted_quantity`. The ledger preserves the correction for audit.

### 3.5 Transaction Void Workflow

Voiding is only allowed for a transaction whose parent `Shift` is still `active`:

1. Set the transaction `payment_status = "voided"` and fill `voided_by`, `void_reason`, `voided_at`.
2. Restore stock: for each ingredient consumed, `$inc` `current_stock` back up, and log a `Stock` entry with `adjustment_type = "void_return"` (positive `quantity_changed`) and `reference_id` = the transaction id.
3. Exclude voided transactions from all revenue, COGS, and shift reconciliation calculations.

### 3.6 Shift Closure / Reconciliation Workflow

When the cashier confirms shift closure:

1. Aggregate successful (non-voided) transactions of the shift: `total_cash_sales` (cash) and `total_qris_sales` (qris).
2. `expected_cash = starting_cash + total_cash_sales + total_cash_in - total_cash_out`.
3. `variance = actual_cash - expected_cash` (0 = balanced, positive = surplus, negative = shortage).
4. Set `status = "closed"`, `end_time = now`, persist the computed fields, and reset the UI to the Pre-Shift Activation view.

```

```