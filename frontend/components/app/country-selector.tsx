"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Country {
  code: string
  name: string
  flag: string
  region: string
}

const countries: Country[] = [
  // Europe
  { code: "DE", name: "Germany", flag: "🇩🇪", region: "Europe" },
  { code: "FR", name: "France", flag: "🇫🇷", region: "Europe" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", region: "Europe" },
  { code: "ES", name: "Spain", flag: "🇪🇸", region: "Europe" },
  { code: "IT", name: "Italy", flag: "🇮🇹", region: "Europe" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", region: "Europe" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", region: "Europe" },
  { code: "NO", name: "Norway", flag: "🇳🇴", region: "Europe" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", region: "Europe" },
  { code: "FI", name: "Finland", flag: "🇫🇮", region: "Europe" },

  // North America
  { code: "US", name: "United States", flag: "🇺🇸", region: "North America" },
  { code: "CA", name: "Canada", flag: "🇨🇦", region: "North America" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", region: "North America" },

  // Asia Pacific
  { code: "JP", name: "Japan", flag: "🇯🇵", region: "Asia Pacific" },
  { code: "CN", name: "China", flag: "🇨🇳", region: "Asia Pacific" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", region: "Asia Pacific" },
  { code: "AU", name: "Australia", flag: "🇦🇺", region: "Asia Pacific" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", region: "Asia Pacific" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", region: "Asia Pacific" },
  { code: "IN", name: "India", flag: "🇮🇳", region: "Asia Pacific" },

  // Latin America
  { code: "BR", name: "Brazil", flag: "🇧🇷", region: "Latin America" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", region: "Latin America" },
  { code: "CL", name: "Chile", flag: "🇨🇱", region: "Latin America" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", region: "Latin America" },

  // Middle East & Africa
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", region: "Middle East & Africa" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", region: "Middle East & Africa" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", region: "Middle East & Africa" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", region: "Middle East & Africa" },
]

interface CountrySelectorProps {
  selectedCountries: Country[]
  onCountriesChange: (countries: Country[]) => void
  placeholder?: string
}

export function CountrySelector({
  selectedCountries,
  onCountriesChange,
  placeholder = "Select countries...",
}: CountrySelectorProps) {
  const [open, setOpen] = useState(false)

  const groupedCountries = countries.reduce(
    (acc, country) => {
      if (!acc[country.region]) {
        acc[country.region] = []
      }
      acc[country.region].push(country)
      return acc
    },
    {} as Record<string, Country[]>,
  )

  const toggleCountry = (country: Country) => {
    const isSelected = selectedCountries.some((c) => c.code === country.code)
    if (isSelected) {
      onCountriesChange(selectedCountries.filter((c) => c.code !== country.code))
    } else {
      onCountriesChange([...selectedCountries, country])
    }
  }

  const removeCountry = (countryCode: string) => {
    onCountriesChange(selectedCountries.filter((c) => c.code !== countryCode))
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-transparent"
          >
            {selectedCountries.length > 0 ? `${selectedCountries.length} countries selected` : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search countries..." />
            <CommandList>
              <CommandEmpty>No countries found.</CommandEmpty>
              {Object.entries(groupedCountries).map(([region, regionCountries]) => (
                <CommandGroup key={region} heading={region}>
                  {regionCountries.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={`${country.name} ${country.code}`}
                      onSelect={() => toggleCountry(country)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCountries.some((c) => c.code === country.code) ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="mr-2">{country.flag}</span>
                      {country.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCountries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCountries.map((country) => (
            <Badge
              key={country.code}
              variant="secondary"
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => removeCountry(country.code)}
            >
              {country.flag} {country.name}
              <span className="ml-1 text-xs">×</span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
