import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Webhook, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WEBHOOK_URL = `${window.location.origin}/webhook/v1/receive-payment`;

const createTransactionExample = `{
  "event": "payment.created",
  "type": "boleto",
  "external_id": "23793.38128 60000.000003 00000.000408 1 84340000012345",
  "amount": 123.45,
  "status": "gerado",
  "customer_name": "João Silva",
  "customer_phone": "11999999999",
  "customer_email": "joao@email.com",
  "boleto_url": "https://exemplo.com/boleto/123.pdf"
}`;

const updateStatusExample = `{
  "event": "payment.updated",
  "type": "boleto",
  "external_id": "23793.38128 60000.000003 00000.000408 1 84340000012345",
  "amount": 123.45,
  "status": "pago"
}`;

const pixExample = `{
  "event": "payment.created",
  "type": "pix",
  "external_id": "pix-12345",
  "amount": 50.00,
  "status": "pago",
  "customer_name": "Maria Santos",
  "customer_phone": "11988887777",
  "customer_email": "maria@email.com"
}`;

const cardExample = `{
  "event": "payment.created",
  "type": "cartao",
  "external_id": "card-12345",
  "amount": 199.90,
  "status": "pendente",
  "customer_name": "Carlos Oliveira",
  "customer_email": "carlos@email.com",
  "customer_document": "12345678900"
}`;

export function WebhookDocumentation() {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    create: true,
    update: false,
    pix: false,
    card: false,
  });
  const { toast } = useToast();

  const copyToClipboard = (text: string, type: "url" | "json") => {
    navigator.clipboard.writeText(text);
    if (type === "url") {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
    toast({
      title: "Copiado!",
      description: type === "url" ? "URL copiada para a área de transferência" : "JSON copiado para a área de transferência",
    });
  };

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Webhook className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Webhook de Pagamentos</CardTitle>
            <CardDescription>
              Endpoint para receber notificações de pagamentos
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* URL do Webhook */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">URL do Webhook</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-secondary rounded-lg px-4 py-3 text-sm font-mono text-foreground break-all">
              {WEBHOOK_URL}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(WEBHOOK_URL, "url")}
            >
              {copiedUrl ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Campos Aceitos */}
        <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-primary">Campos Aceitos</h4>
          <div className="grid gap-2 text-sm">
            <div className="flex items-start gap-2">
              <Badge variant="destructive" className="text-xs mt-0.5">Obrigatórios</Badge>
              <span className="text-muted-foreground">type (boleto, pix, cartao), amount</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className="text-xs mt-0.5">Cliente</Badge>
              <span className="text-muted-foreground">customer_name, customer_phone, customer_email, customer_document</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className="text-xs mt-0.5">Boleto</Badge>
              <span className="text-muted-foreground">boleto_url, external_id (código de barras)</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className="text-xs mt-0.5">Status</Badge>
              <span className="text-muted-foreground">gerado, pago, pendente, cancelado, expirado</span>
            </div>
          </div>
        </div>

        {/* Exemplos */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Exemplos de Requisição</h4>
          
          {/* Criar Transação - Boleto */}
          <Collapsible open={openSections.create} onOpenChange={() => toggleSection("create")}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between hover:bg-secondary">
                <span>Criar Transação (Boleto)</span>
                {openSections.create ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="relative mt-2">
                <pre className="bg-secondary rounded-lg p-4 text-sm font-mono text-foreground overflow-x-auto">
                  {createTransactionExample}
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(createTransactionExample, "json")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Atualizar Status */}
          <Collapsible open={openSections.update} onOpenChange={() => toggleSection("update")}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between hover:bg-secondary">
                <span>Atualizar Status (Boleto Pago)</span>
                {openSections.update ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="relative mt-2">
                <pre className="bg-secondary rounded-lg p-4 text-sm font-mono text-foreground overflow-x-auto">
                  {updateStatusExample}
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(updateStatusExample, "json")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* PIX */}
          <Collapsible open={openSections.pix} onOpenChange={() => toggleSection("pix")}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between hover:bg-secondary">
                <span>Pagamento PIX</span>
                {openSections.pix ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="relative mt-2">
                <pre className="bg-secondary rounded-lg p-4 text-sm font-mono text-foreground overflow-x-auto">
                  {pixExample}
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(pixExample, "json")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Cartão */}
          <Collapsible open={openSections.card} onOpenChange={() => toggleSection("card")}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between hover:bg-secondary">
                <span>Pagamento Cartão</span>
                {openSections.card ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="relative mt-2">
                <pre className="bg-secondary rounded-lg p-4 text-sm font-mono text-foreground overflow-x-auto">
                  {cardExample}
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(cardExample, "json")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Método e Headers */}
        <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-foreground">Configuração da Requisição</h4>
          <div className="grid gap-1 text-sm">
            <div className="flex gap-2">
              <span className="text-muted-foreground">Método:</span>
              <Badge variant="outline">POST</Badge>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">Content-Type:</span>
              <code className="text-xs bg-background px-2 py-0.5 rounded">application/json</code>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
