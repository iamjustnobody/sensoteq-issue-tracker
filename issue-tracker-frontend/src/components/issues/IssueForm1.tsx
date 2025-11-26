import React, { useState, useEffect } from "react";
import { Modal, Button, Input } from "../ui";
import { STATUS_OPTIONS } from "../../utils/constants";
import type {
  Issue,
  CreateIssueDTO,
  UpdateIssueDTO,
  IssueStatus,
} from "../../types";

interface IssueFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateIssueDTO | UpdateIssueDTO) => Promise<void>;
  issue?: Issue | null;
}

export const IssueForm: React.FC<IssueFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  issue,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "not-started" as IssueStatus,
    progress: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or issue changes
  useEffect(() => {
    if (isOpen) {
      if (issue) {
        setFormData({
          title: issue.title,
          description: issue.description || "",
          status: issue.status,
          progress: issue.progress,
        });
      } else {
        setFormData({
          title: "",
          description: "",
          status: "not-started",
          progress: 0,
        });
      }
      setErrors({});
    }
  }, [isOpen, issue]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 255) {
      newErrors.title = "Title must be less than 255 characters";
    }

    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = "Progress must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        status: formData.status,
        progress: formData.progress,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save issue:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "progress" ? parseInt(value) || 0 : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={issue ? "Edit Issue" : "Create New Issue"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <Input
          name="title"
          label="Title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter issue title"
          error={errors.title}
          autoFocus
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Enter issue description (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                       resize-none"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Progress */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Progress: {formData.progress}%
          </label>
          <input
            type="range"
            name="progress"
            min="0"
            max="100"
            value={formData.progress}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          {errors.progress && (
            <p className="mt-1 text-sm text-red-500">{errors.progress}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : issue ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
