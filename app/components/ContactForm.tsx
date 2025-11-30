"use client";
import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // data save logic
    alert("Form submitted!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full  grid gap-4">
      
      {/* Name & Email - 2 column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="border rounded-lg border-zinc-400 bg-transparent p-2 outline-none focus:border-brand"
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="border rounded-lg border-zinc-400 bg-transparent p-2 outline-none focus:border-brand"
        />
      </div>

      {/* Message - full width */}
      <textarea
        name="message"
        placeholder="Your Message"
        value={formData.message}
        onChange={handleChange}
        required
        rows={1}
        className="border rounded-lg border-zinc-400 bg-transparent p-2 outline-none focus:border-brand"
      />

      {/* Submit Button */}
      <button
        type="submit"
        className="text-white group hover:text-brand font-extrabold px-6 py-2 transition-all duration-500 text-sm w-fit mt-2"
      >
        SENT MESSAGE 
        <span className="ml-2 text-lg group-hover:ml-5 group-hover:text-brand transition-all duration-500">➠</span>
      </button>
    </form>
  );
}
