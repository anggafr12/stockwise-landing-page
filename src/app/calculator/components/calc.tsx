"use client"

import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import React, { useState } from "react"

type CompoundInterestForm = {
  principal: number
  rate: number
  timesPerYear: number
  years: number
}

type AraArbForm = {
  principal: number
  years: number
  ara: number
  arb: number
}

export function CalculatorCard({ className, ...props }: React.ComponentProps<"div">) {
  const compoundForm = useForm<CompoundInterestForm>({
    defaultValues: { principal: 1000, rate: 10, timesPerYear: 1, years: 1 },
  })

  const araArbForm = useForm<AraArbForm>({
    defaultValues: { principal: 1000, years: 1, ara: 0, arb: 0 },
  })

  const [compoundResult, setCompoundResult] = useState<number | null>(null)
  const [araArbResult, setAraArbResult] = useState<number | null>(null)

  const calculateCompoundInterest = (values: CompoundInterestForm) => {
    const { principal, rate, timesPerYear, years } = values
    const result = principal * Math.pow(1 + rate / 100 / timesPerYear, timesPerYear * years)
    setCompoundResult(parseFloat(result.toFixed(2)))
  }

  const calculateAraArb = (values: AraArbForm) => {
    const { principal, years, ara, arb } = values
    const result = principal + ara * years - arb * years
    setAraArbResult(parseFloat(result.toFixed(2)))
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Flex container horizontal */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Compound Interest */}
        <Card className="flex-1">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Compound Interest Calculator</CardTitle>
            <CardDescription>Calculate your investment growth over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...compoundForm}>
              <form onSubmit={compoundForm.handleSubmit(calculateCompoundInterest)} className="grid gap-4">
                <FormField
                  control={compoundForm.control}
                  name="principal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Principal Amount</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={compoundForm.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Interest Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={compoundForm.control}
                  name="timesPerYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Times Compounded Per Year</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={compoundForm.control}
                  name="years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Calculate</Button>
              </form>
            </Form>
            {compoundResult !== null && (
              <p className="mt-4 text-center font-medium">Result: {compoundResult}</p>
            )}
          </CardContent>
        </Card>

        {/* ARA & ARB Calculator */}
        <Card className="flex-1">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">ARA & ARB Calculator</CardTitle>
            <CardDescription>Calculate your ARA & ARB returns.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...araArbForm}>
              <form onSubmit={araArbForm.handleSubmit(calculateAraArb)} className="grid gap-4">
                <FormField
                  control={araArbForm.control}
                  name="principal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Principal Amount</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={araArbForm.control}
                  name="years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={araArbForm.control}
                  name="ara"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ARA (%)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={araArbForm.control}
                  name="arb"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ARB (%)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Calculate</Button>
              </form>
            </Form>
            {araArbResult !== null && (
              <p className="mt-4 text-center font-medium">Result: {araArbResult}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Back button */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={() => window.location.href = "/"}>
          Back
        </Button>
      </div>
    </div>
  )
}
