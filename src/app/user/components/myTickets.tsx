import { Badge } from "@/app/lms-main/components/ui/badge";
import { Button } from "@/app/lms-main/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/lms-main/components/ui/tabs";
import { Calendar, Ticket } from "lucide-react";

const MyTickets = () => {
  const tickets = [
    {
      id: 1,
      status: "expired",
      title: "Stockwise Community Conference....",
      date: "March 8, 2024",
      ticketCount: "1x Ticket",
      purchaseDate: "Purchase on Mar 27, 2024, 15:15",
    },
    {
      id: 2,
      status: "complete",
      title: "Stockwise Community Conference....",
      date: "March 8, 2024",
      ticketCount: "1x Ticket",
      purchaseDate: "Purchase on Mar 27, 2024, 15:15",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-8">My Tickets</h1>
      
      <Tabs defaultValue="live" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger 
            value="live"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative"
          >
            Event Live
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary data-[state=active]:block hidden"></span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-start justify-between mb-4">
                <Badge 
                  variant={ticket.status === "expired" ? "destructive" : "secondary"}
                  className={
                    ticket.status === "expired" 
                      ? "bg-destructive text-destructive-foreground" 
                      : "bg-success text-success-foreground"
                  }
                >
                  {ticket.status === "expired" ? "Order Expired" : "Order Complete"}
                </Badge>
                <Button variant="link" className="text-primary h-auto p-0">
                  Check Event
                </Button>
              </div>

              <div className="flex gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {ticket.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{ticket.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-primary" />
                      <span>{ticket.ticketCount}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{ticket.purchaseDate}</p>
                </div>

                <div className="w-64 h-36 bg-secondary rounded-lg overflow-hidden flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-warning/20 to-warning/10"></div>
                  <div className="relative text-center">
                    <div className="text-2xl font-bold text-foreground mb-1">BUSINESS</div>
                    <div className="text-xl font-bold text-foreground mb-2">CONFERENCE</div>
                    <div className="text-lg text-muted-foreground mb-1">2023</div>
                    <div className="text-xs text-muted-foreground">OCTOBER 28 - GEPIN</div>
                  </div>
                  {/* Decorative circles */}
                  <div className="absolute top-4 right-4 w-20 h-20 rounded-full border-4 border-warning/30"></div>
                  <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full border-4 border-warning/30"></div>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyTickets;
