"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitCharityRegistration } from "@/features/actions/register";
import { toast } from "sonner";

type CharitySignupModalProps = {
  triggerLabel?: string;
};

export default function CharitySignupModal({
  triggerLabel = "Register your charity",
}: CharitySignupModalProps) {
  const [open, setOpen] = useState(false);
  const [organisationName, setOrganisationName] = useState("");
  const [charityNumber, setCharityNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [mission, setMission] = useState("");
  const [loading, setLoading] = useState(false);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   try {
  //     setLoading(true);
  //     const formData = new FormData();
  //     formData.append('organisationName', organisationName);
  //     formData.append('charityNumber', charityNumber);
  //     formData.append('contactName', contactName);
  //     formData.append('contactEmail', contactEmail);
  //     if (website) formData.append('website', website);
  //     if (mission) formData.append('mission', mission);
  //     await submitCharityRegistration(formData);
  //     toast.success("Charity application submitted successfully!");
  //     setOpen(false);
  //     console.log("Submitted!", {
  //       organisationName,
  //       charityNumber,
  //     });
  //     // Reset form
  //     setOrganisationName("");
  //     setCharityNumber("");
  //     setContactName("");
  //     setContactEmail("");
  //     setWebsite("");
  //     setMission("");
  //   } catch (error) {
  //     toast.error("Failed to submit application. Please try again.");
  //     console.error("Submission error:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSuccess = async () => {
  console.log("CLIENT: Charity submitted!");
  toast.success("Application submitted!");
  alert("Submitted!"); // For testing
  setOpen(false);
};


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-[#768755] hover:bg-[#637346]">
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Charity signup</DialogTitle>
          <DialogDescription>
            Tell us a bit about your organisation so we can verify and onboard you onto SustainWear.
          </DialogDescription>
        </DialogHeader>

        <form action={submitCharityRegistration} className="space-y-4 pt-2">


          <div className="space-y-2">
            <Label htmlFor="organisationName">Organisation name</Label>
            <Input
              id="organisationName"
              name="organisationName"
              required
              value={organisationName}
              onChange={(e) => setOrganisationName(e.target.value)}
              placeholder="e.g. Sheffield Clothing Bank"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="charityNumber">Charity registration number</Label>
            <Input
              id="charityNumber"
              name="charityNumber"
              required
              value={charityNumber}
              onChange={(e) => setCharityNumber(e.target.value)}
              placeholder="e.g. 1234567"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactName">Primary contact name</Label>
              <Input
                id="contactName"
                name="contactName"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact email</Label>
              <Input
                id="contactEmail"
                type="email"
                name="contactEmail"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="you@charity.org"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (optional)</Label>
            <Input
              id="website"
              name="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://your-charity.org"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mission">Brief mission / focus (optional)</Label>
            <Textarea
              id="mission"
              name="mission" 
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              placeholder="Describe what your charity does and who you support."
              rows={4}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              formAction={handleSuccess}
              className="bg-[#768755] hover:bg-[#637346]"
            >
              Submit application
            </Button>

          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
