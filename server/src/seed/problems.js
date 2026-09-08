export const problems = [
  {
    title: "Parking Lot System",
    description: "Design a generic parking lot system.",
    requirements: [
      "Support multiple floors",
      "Different vehicle types (car, bike, truck)",
      "Different spot sizes",
      "Entry and exit points",
      "Ticket-based tracking",
      "Fee calculation based on duration"
    ],
    context: "System is for a multi-level smart parking building.",
    hints: ["Use Factory for ticket generation", "Strategy pattern for fee calculation"],
    difficulty: "medium",
    keyEntities: [
      { name: "ParkingLot", suggestedResponsibilities: ["Manage floors", "Entry/Exit coordination"] },
      { name: "ParkingFloor", suggestedResponsibilities: ["Manage spots"] },
      { name: "ParkingSpot", suggestedResponsibilities: ["Vehicle assignment", "Status tracking"] },
      { name: "Vehicle", suggestedResponsibilities: ["Hold vehicle details"] },
      { name: "Ticket", suggestedResponsibilities: ["Track entry time"] },
      { name: "EntryPanel", suggestedResponsibilities: ["Generate tickets"] },
      { name: "ExitPanel", suggestedResponsibilities: ["Process payment"] },
      { name: "FeeCalculator", suggestedResponsibilities: ["Calculate fee based on time and type"] }
    ],
    expectedRelationships: [
      "ParkingLot has many ParkingFloor",
      "ParkingFloor has many ParkingSpot"
    ]
  },
  {
    title: "Elevator System",
    description: "Design an elevator control system for a building.",
    requirements: [
      "Multiple elevators in a building",
      "Handle up/down requests from floors",
      "Handle target floor requests from inside elevator",
      "Efficient scheduling",
      "Door open/close mechanism",
      "Floor display",
      "Weight limit check"
    ],
    context: "A busy commercial building with 50 floors and 4 elevators.",
    hints: ["Consider State pattern for elevator states", "Observer pattern for displays"],
    difficulty: "hard",
    keyEntities: [
      { name: "Building", suggestedResponsibilities: ["Manage elevators and floors"] },
      { name: "Elevator", suggestedResponsibilities: ["Move", "Track current floor", "Weight check"] },
      { name: "ElevatorController", suggestedResponsibilities: ["Scheduling algorithm"] },
      { name: "Request", suggestedResponsibilities: ["Hold request data"] },
      { name: "Door", suggestedResponsibilities: ["Open/Close status"] },
      { name: "Display", suggestedResponsibilities: ["Show current floor"] },
      { name: "Button", suggestedResponsibilities: ["Trigger requests"] }
    ],
    expectedRelationships: [
      "Building has many Elevator",
      "Elevator has ElevatorController"
    ]
  },
  {
    title: "Vending Machine",
    description: "Design a fully functional vending machine.",
    requirements: [
      "Multiple products with inventory tracking",
      "Coin and note acceptance",
      "Change calculation and dispensation",
      "Product dispensing",
      "Refund/Cancel functionality",
      "Admin restocking"
    ],
    context: "Standard snack/drink vending machine.",
    hints: ["State pattern is highly recommended here to handle Idle, HasMoney, Dispensing states."],
    difficulty: "medium",
    keyEntities: [
      { name: "VendingMachine", suggestedResponsibilities: ["Context for state machine", "Hold inventory"] },
      { name: "Product", suggestedResponsibilities: ["Product details and price"] },
      { name: "Inventory", suggestedResponsibilities: ["Track quantities"] },
      { name: "PaymentProcessor", suggestedResponsibilities: ["Handle money logic"] },
      { name: "CoinAcceptor", suggestedResponsibilities: ["Validate and hold coins"] },
      { name: "Display", suggestedResponsibilities: ["Show messages"] },
      { name: "State", suggestedResponsibilities: ["Base state interface"] }
    ],
    expectedRelationships: [
      "VendingMachine has Inventory",
      "VendingMachine has State"
    ]
  }
];