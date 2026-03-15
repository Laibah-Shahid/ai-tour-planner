"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Dummy user and trips data for now
const dummyUser = {
  name: "John Doe",
  email: "john@example.com",
  avatar: null,
};

const dummyTrips = [
  {
    id: 1,
    name: "Skardu Adventure",
    start_date: "2026-04-10",
    end_date: "2026-04-17",
    destination: "Skardu",
    budget: 50000,
    notes: "Excited for the mountains!",
  },
];

export default function ProfilePage() {
  const [user, setUser] = useState(dummyUser);
  const [trips] = useState(dummyTrips);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);

  const handleSave = () => {
    setUser({ ...user, name: editName, email: editEmail });
    setEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold">
          {user.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            user.name[0]
          )}
        </div>
        <div>
          {editing ? (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={editName} onChange={e => setEditName(e.target.value)} />
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={editEmail} readOnly className="bg-gray-100 cursor-not-allowed" />
              <div className="flex gap-2 mt-2">
                <Button onClick={handleSave}>Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-xl font-semibold">{user.name}</div>
              <div className="text-gray-600">{user.email}</div>
              <Button className="mt-2" size="sm" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            </>
          )}
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-4">My Trips</h2>
      <div className="space-y-4">
        {trips.length === 0 ? (
          <div className="text-gray-500">No trips yet.</div>
        ) : (
          trips.map(trip => (
            <div key={trip.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <div className="font-semibold text-lg">{trip.name}</div>
                <div className="text-gray-600 text-sm">{trip.destination} | {trip.start_date} - {trip.end_date}</div>
              </div>
              <Button size="sm" variant="outline">View Details</Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
