import { Button } from "@/app/lms-main/components/ui/button";
import { Input } from "@/app/lms-main/components/ui/input";
import { Label } from "@/app/lms-main/components/ui/label";

const Password = () => {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-foreground mb-8">Change Password</h1>
      
      <div className="bg-card rounded-lg p-8 border border-border space-y-6">
        <div>
          <Label htmlFor="current" className="text-foreground mb-2 block">Current Password</Label>
          <Input 
            id="current" 
            type="password"
            className="bg-input border-border focus-visible:ring-primary"
            placeholder="Enter your current password"
          />
        </div>

        <div>
          <Label htmlFor="new" className="text-foreground mb-2 block">New Password</Label>
          <Input 
            id="new" 
            type="password"
            className="bg-input border-border focus-visible:ring-primary"
            placeholder="Enter your new password"
          />
        </div>

        <div>
          <Label htmlFor="confirm" className="text-foreground mb-2 block">Confirm New Password</Label>
          <Input 
            id="confirm" 
            type="password"
            className="bg-input border-border focus-visible:ring-primary"
            placeholder="Confirm your new password"
          />
        </div>

        <div className="pt-4">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-12">
            Update Password
          </Button>
        </div>
      </div>

      <div className="mt-8 bg-card rounded-lg p-6 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3">Password Requirements</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Minimum 8 characters long
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            At least one uppercase letter
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            At least one number
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            At least one special character
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Password;
