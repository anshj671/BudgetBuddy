// components/ui/chart.tsx
import * as React from "react"

const Chart = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div className="relative" ref={ref} {...props} />
))
Chart.displayName = "Chart"

const ChartContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className="relative" ref={ref} {...props} />,
)
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      className="absolute z-10 hidden rounded-md border bg-popover p-2 text-sm text-popover-foreground group-hover:block"
      ref={ref}
      {...props}
    />
  ),
)
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} {...props} />,
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} {...props} />,
)
ChartLegend.displayName = "ChartLegend"

const ChartLegendItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} {...props} />,
)
ChartLegendItem.displayName = "ChartLegendItem"

const ChartLegendItemColor = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => <div ref={ref} style={style} {...props} />,
)
ChartLegendItemColor.displayName = "ChartLegendItemColor"

const ChartLegendItemLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} {...props} />,
)
ChartLegendItemLabel.displayName = "ChartLegendItemLabel"

const ChartLegendItemValue = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} {...props} />,
)
ChartLegendItemValue.displayName = "ChartLegendItemValue"

const ChartPie = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} {...props} />,
)
ChartPie.displayName = "ChartPie"

const ChartPieSeries = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  ),
)
ChartPieSeries.displayName = "ChartPieSeries"

const ChartPieValueLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} {...props} />,
)
ChartPieValueLabel.displayName = "ChartPieValueLabel"

interface ChartBarProps extends React.HTMLAttributes<HTMLDivElement> {
  data: any[]
  xAxis?: React.ReactNode
  yAxis?: React.ReactNode
}

const ChartBar = React.forwardRef<HTMLDivElement, ChartBarProps>(
  ({ className, data, xAxis, yAxis, children, ...props }, ref) => (
    <div ref={ref} {...props}>
      {yAxis}
      <div className="flex-1">
        {children}
      </div>
      {xAxis}
    </div>
  ),
)
ChartBar.displayName = "ChartBar"

const ChartBarSeries = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  ),
)
ChartBarSeries.displayName = "ChartBarSeries"

const ChartBarItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} {...props} />,
)
ChartBarItem.displayName = "ChartBarItem"

const ChartBarValueLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} {...props} />,
)
ChartBarValueLabel.displayName = "ChartBarValueLabel"

const ChartXAxis = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} {...props} />,
)
ChartXAxis.displayName = "ChartXAxis"

const ChartYAxis = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} {...props} />,
)
ChartYAxis.displayName = "ChartYAxis"

export {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendItem,
  ChartLegendItemColor,
  ChartLegendItemLabel,
  ChartLegendItemValue,
  ChartPie,
  ChartPieSeries,
  ChartPieValueLabel,
  ChartBar,
  ChartBarSeries,
  ChartBarItem,
  ChartBarValueLabel,
  ChartXAxis,
  ChartYAxis,
}

