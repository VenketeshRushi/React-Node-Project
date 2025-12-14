import { useState } from "react";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    employees: "",
    message: "",
    agree: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (key: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className='w-full gap-2 rounded-md border p-5 md:p-8'>
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className='text-center'
        >
          <motion.div
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className='mx-auto mb-4 flex w-fit justify-center rounded-full border p-2'
          >
            <Check className='size-8' />
          </motion.div>
          <h2 className='mb-2 text-2xl font-bold'>Thank you!</h2>
          <p className='text-muted-foreground text-lg'>
            Your message has been received. We’ll get back to you soon.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className='w-full max-w-2xl'>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Contact Information</FieldLegend>
            <FieldDescription>
              Please fill out the form below and we’ll get in touch shortly.
            </FieldDescription>

            <FieldGroup>
              <Field>
                <FieldLabel>Full Name *</FieldLabel>
                <Input
                  placeholder='John Doe'
                  value={formData.name}
                  onChange={e => handleChange("name", e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel>Email Address *</FieldLabel>
                <Input
                  type='email'
                  placeholder='john@company.com'
                  value={formData.email}
                  onChange={e => handleChange("email", e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel>Company Name</FieldLabel>
                <Input
                  placeholder='Your company'
                  value={formData.company}
                  onChange={e => handleChange("company", e.target.value)}
                />
              </Field>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <Field>
                  <FieldLabel>Number of Employees</FieldLabel>
                  <Select
                    value={formData.employees}
                    onValueChange={val => handleChange("employees", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select size' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='1'>1</SelectItem>
                      <SelectItem value='2-10'>2–10</SelectItem>
                      <SelectItem value='11-50'>11–50</SelectItem>
                      <SelectItem value='51-500'>51–500</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field>
                <FieldLabel>Your Message *</FieldLabel>
                <Textarea
                  placeholder='Write your message here'
                  value={formData.message}
                  onChange={e => handleChange("message", e.target.value)}
                  className='resize-none'
                  required
                />
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          <FieldSet>
            <FieldLegend>Consent</FieldLegend>
            <FieldGroup>
              <Field orientation='horizontal'>
                <Checkbox
                  checked={formData.agree}
                  onCheckedChange={val => handleChange("agree", !!val)}
                  required
                />
                <FieldLabel className='font-normal'>
                  I agree to the terms and conditions
                </FieldLabel>
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          <Field orientation='horizontal' className='justify-end'>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='rounded-lg'
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
