"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, X, Check } from "lucide-react"
import { campaignApi } from "@/lib/api"
import { useAppStore } from "@/lib/store"
import type { CampaignCreate } from "@/lib/types"

const COUNTRIES = [
  "France", "Germany", "United Kingdom", "Italy", "Spain", "Netherlands", 
  "Belgium", "Switzerland", "Austria", "Portugal", "Sweden", "Denmark",
  "Norway", "Finland", "Poland", "Czech Republic", "Hungary", "Romania",
  "Bulgaria", "Croatia", "Slovenia", "Slovakia", "Estonia", "Latvia",
  "Lithuania", "Luxembourg", "Malta", "Cyprus", "Ireland", "Greece",
  "United States", "Canada", "Australia", "New Zealand", "Japan",
  "South Korea", "Singapore", "Hong Kong", "United Arab Emirates",
  "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman", "Israel",
  "South Africa", "Kenya", "Nigeria", "Ghana", "Morocco", "Egypt",
  "Tunisia", "Algeria", "Senegal", "Mali", "Burkina Faso", "Niger",
  "Guinea", "Benin", "Togo", "Liberia", "Sierra Leone", "Gambia"
]

const SECTORS = [
  "Technology", "Healthcare", "Finance", "Manufacturing", "Retail",
  "Real Estate", "Energy", "Education", "Transportation", "Hospitality",
  "Agriculture", "Construction", "Media", "Telecommunications", "Automotive",
  "Pharmaceuticals", "Aerospace", "Defense", "Food & Beverage", "Fashion",
  "Entertainment", "Sports", "Non-profit", "Government", "Consulting"
]

const formSchema = z.object({
  name: z.string().min(1, "Campaign name is required").max(255, "Name too long"),
  product_description: z.string().min(10, "Product description must be at least 10 characters"),
  target_location: z.string().min(1, "Target location is required"),
  target_sectors: z.array(z.string()).min(1, "At least one sector is required"),
  prospect_count: z.number().min(1, "Prospect count must be at least 1").max(1000, "Maximum 1000 prospects"),
})

type FormValues = z.infer<typeof formSchema>

interface CampaignCreationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children?: React.ReactNode
}

export function CampaignCreationModal({ open, onOpenChange, children }: CampaignCreationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { addCampaign } = useAppStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      product_description: "",
      target_location: "France",
      target_sectors: [],
      prospect_count: 50,
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    try {
      const campaignData: CampaignCreate = {
        name: values.name,
        product_description: values.product_description,
        target_location: values.target_location,
        target_sectors: values.target_sectors,
        prospect_count: values.prospect_count,
      }

      const campaign = await campaignApi.createCampaign(campaignData)
      addCampaign(campaign)
      
      toast({
        title: "Campaign Created",
        description: `Campaign "${campaign.name}" has been created successfully.`,
        duration: 5000,
      })

      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create campaign:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create campaign",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addSector = (sector: string) => {
    const currentSectors = form.getValues("target_sectors")
    if (!currentSectors.includes(sector)) {
      form.setValue("target_sectors", [...currentSectors, sector])
    }
  }

  const removeSector = (sector: string) => {
    const currentSectors = form.getValues("target_sectors")
    form.setValue("target_sectors", currentSectors.filter(s => s !== sector))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Set up a new prospecting campaign with targeted criteria.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Q1 2024 Tech Prospects" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="product_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your product or service in detail..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide details about your product or service to help agents better understand your targeting needs.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target location..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the primary country where you want to find prospects.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_sectors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Sectors</FormLabel>
                    <Select onValueChange={addSector}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sectors..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SECTORS.filter(sector => !field.value.includes(sector)).map((sector) => (
                          <SelectItem key={sector} value={sector}>
                            {sector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((sector) => (
                        <Badge key={sector} variant="secondary">
                          {sector}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1"
                            onClick={() => removeSector(sector)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <FormDescription>
                      Choose the industries you want to target.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prospect_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Prospect Count</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        max="1000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of prospects you want to find (1-1000)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">AI Agents Configuration</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  The following agents will be automatically configured for your campaign:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Market Researcher</Badge>
                    <span className="text-sm text-muted-foreground">Finds and analyzes target markets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Prospecting Specialist</Badge>
                    <span className="text-sm text-muted-foreground">Identifies and qualifies prospects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Content Writer</Badge>
                    <span className="text-sm text-muted-foreground">Creates personalized outreach content</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Check className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}