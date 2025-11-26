import React, { useEffect } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { Modal, Button } from "../ui/index.js";
import { useIssueQuery } from "../../hooks/useIssueQuery.js";
import { LoadFormModal } from "./LoadFormModal.js";
import {
  createIssueSchema,
  type CreateIssueFormData,
} from "../../schemas/issue.schema.js";
import { STATUS_OPTIONS } from "../../utils/constants.js";

interface IssueFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Called after successful create/update
  issueId?: number | null; // If provided, fetch and edit this issue
}

export const IssueForm: React.FC<IssueFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  issueId,
}) => {
  const isEditMode = issueId != null;

  // Fetch issue data for editing (only if issueId is provided)
  const {
    data: issue,
    isLoading: isLoadingIssue,
    error: fetchError,
  } = useIssueQuery(isEditMode ? issueId : null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<CreateIssueFormData>({
    resolver: zodResolver(
      createIssueSchema
    ) as unknown as Resolver<CreateIssueFormData>,
    defaultValues: {
      title: "",
      description: "",
      status: "not-started",
      progress: 0,
    },
    mode: "onChange",
  });

  const progressValue = watch("progress");

  // Populate form when issue data is loaded
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && issue) {
        reset({
          title: issue.title,
          description: issue.description || "",
          status: issue.status,
          progress: issue.progress,
        });
      } else if (!isEditMode) {
        reset({
          title: "",
          description: "",
          status: "not-started",
          progress: 0,
        });
      }
    } else {
      // Reset form when modal closes
      reset({
        title: "",
        description: "",
        status: "not-started",
        progress: 0,
      });
      return;
    }
  }, [isOpen, isEditMode, issue, reset]);

  const onSubmit = async (data: CreateIssueFormData) => {
    try {
      // The actual API call is handled by the parent component
      // through the onSuccess callback
      onSuccess();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    }
  };

  const handleClose = () => {
    if (isDirty) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to close?"
        )
      ) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? "Edit Issue" : "Create New Issue"}
      className="max-w-md"
    >
      <div className="min-h-[420px]">
        {isLoadingIssue && isEditMode && false ? (
          // Loading skeleton while fetching issue
          <LoadFormModal />
        ) : fetchError ? (
          // Error state
          <div className="flex flex-col items-center justify-center min-h-[420px] text-center">
            <p className="text-red-500 mb-4">
              {fetchError instanceof Error
                ? fetchError.message
                : String(fetchError)}
            </p>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          // Form
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                {...register("title")}
                placeholder="Enter issue title"
                autoFocus
                className={`w-full px-3 py-2 border rounded-lg transition-colors
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                ${errors.title ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder="Enter issue description (optional)"
                className={`w-full px-3 py-2 border rounded-lg transition-colors
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none
                ${errors.description ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                {...register("status")}
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
                Progress: {progressValue}%
              </label>
              <Controller
                name="progress"
                control={control}
                render={({ field }) => (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                )}
              />
              {errors.progress && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.progress.message}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={!isValid || isSubmitting}
                className="flex-1"
              >
                <span className="text-blue-700">
                  {isEditMode ? "Update" : "Create"}
                </span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
