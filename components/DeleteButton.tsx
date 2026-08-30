"use client";
export function DeleteButton({ action, label }: { action: () => void; label: string }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(`Delete this ${label}? This cannot be undone.`)) e.preventDefault();
      }}
    >
      <button className="bg-mission-failure text-white hover:bg-red-700">Delete</button>
    </form>
  );
}
