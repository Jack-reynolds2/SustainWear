"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Inbox, Check, X, ExternalLink } from "lucide-react";

export type CharityApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type CharityApplication = {
  id: string;
  name: string;
  slug?: string | null;
  website?: string | null;
  contactEmail?: string | null;
  submittedAt: string | Date;
  status: CharityApplicationStatus;
  submittedByName?: string | null;
  submittedByEmail?: string | null;
  notes?: string | null;
};

type SysAdminNotificitonModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applications: CharityApplication[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
};

export default function SysAdminNotificitonModal({
  open,
  onOpenChange,
  applications,
  onApprove,
  onReject,
}: SysAdminNotificitonModalProps) {
  const pendingApplications = applications.filter(
    (app) => app.status === "PENDING"
  );

  const formatDate = (value: string | Date) => {
    const d = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(d.getTime())) return "Unknown";
    return d.toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[480px] max-w-2xl flex-col gap-3 p-0">
        <DialogHeader className="px-6 pt-6 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted">
                <Inbox className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base">
                  Charity applications
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Review and approve new charity organisations requesting access
                  to SustainWear.
                </p>
              </div>
            </div>

            {pendingApplications.length > 0 && (
              <Badge className="text-xs">
                {pendingApplications.length} pending
              </Badge>
            )}
          </div>
        </DialogHeader>

        <Separator />

        <ScrollArea className="flex-1 px-1">
          <div className="flex flex-col gap-3 px-5 py-3">
            {applications.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No charity applications to review right now.
              </p>
            )}

            {applications.map((app) => (
              <div
                key={app.id}
                className="rounded-lg border bg-background px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{app.name}</span>
                      {app.status === "PENDING" && (
                        <Badge variant="secondary" className="text-[10px]">
                          Pending
                        </Badge>
                      )}
                      {app.status === "APPROVED" && (
                        <Badge variant="outline" className="text-[10px]">
                          Approved
                        </Badge>
                      )}
                      {app.status === "REJECTED" && (
                        <Badge variant="destructive" className="text-[10px]">
                          Rejected
                        </Badge>
                      )}
                    </div>
                    {app.slug && (
                      <p className="text-[11px] text-muted-foreground">
                        Slug: {app.slug}
                      </p>
                    )}
                    {app.website && (
                      <a
                        href={app.website}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Visit website
                      </a>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-muted-foreground">
                    <p>Submitted: {formatDate(app.submittedAt)}</p>
                    {app.submittedByName && (
                      <p>By: {app.submittedByName}</p>
                    )}
                    {!app.submittedByName && app.submittedByEmail && (
                      <p>By: {app.submittedByEmail}</p>
                    )}
                  </div>
                </div>

                <div className="mt-2 grid gap-2 text-xs md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:items-end">
                  <div className="space-y-1">
                    {app.contactEmail && (
                      <p>
                        <span className="font-medium">Contact:</span>{" "}
                        <span className="text-muted-foreground">
                          {app.contactEmail}
                        </span>
                      </p>
                    )}
                    {app.notes && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Notes:</span>{" "}
                        {app.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReject?.(app.id)}
                      disabled={app.status !== "PENDING" || !onReject}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onApprove?.(app.id)}
                      disabled={app.status !== "PENDING" || !onApprove}
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end border-t px-6 py-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
