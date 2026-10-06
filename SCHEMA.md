# Schema / ERD

```mermaid
erDiagram
  EQUIPMENT ||--o{ BOOKINGS : has
  EQUIPMENT {
    text id PK
    text name
    text location
  }
  BOOKINGS {
    text id PK
    text equipment_id FK
    text borrower_name
    text start_at
    text end_at
    text purpose
  }
```

`bookings.equipment_id` references `equipment.id`, and foreign keys are enabled. Date-times are stored as ISO-8601 text, which sorts chronologically when consistently formatted. SQL values from requests use `?` parameter binding.