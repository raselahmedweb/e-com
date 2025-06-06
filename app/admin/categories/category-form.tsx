"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createCategory, updateCategory } from "../actions"
import { generateSlug } from "@/lib/utils"

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional(),
  image_url: z.string().url("Please enter a valid URL").optional().nullable(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormProps {
  category?: CategoryFormValues & { id: number }
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: category || {
      name: "",
      slug: "",
      description: "",
      image_url: "",
    },
  })

  // Auto-generate slug when name changes
  const watchName = form.watch("name")
  if (watchName && !form.getValues("slug") && !category) {
    form.setValue("slug", generateSlug(watchName))
  }

  const onSubmit = async (data: CategoryFormValues) => {
    console.log(data)
    try {
      setIsSubmitting(true)
      if (category) {
        await updateCategory(category.id, data)
      } else {
        await createCategory(data)
      }
      router.push("/admin/categories")
      router.refresh()
    } catch (error) {
      console.error("Failed to save category:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input placeholder="Electronics" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="electronics" {...field} />
                </FormControl>
                <FormDescription>Used in the URL. Auto-generated from name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Latest gadgets and electronic devices..."
                  className="min-h-32"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>Optional description for the category</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>URL to the category image</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : category ? "Update Category" : "Create Category"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
