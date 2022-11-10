import { useAppSelector } from 'redux/hooks';
import { selectChartData } from 'redux/ChartView/selectors';
import { format } from 'date-fns';
import {
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    CartesianGrid,
} from 'recharts';
import { useTheme } from '@mui/material/styles';

import { ChartContainer } from './styled';

const ChartView = () => {
    const theme = useTheme();

    const chartData = useAppSelector(selectChartData);

    return (
        <ChartContainer>
            <ResponsiveContainer width="90%" height="80%">
                <BarChart data={chartData['Uganda']}>
                    <CartesianGrid
                        stroke="rgba(0, 0, 0, 0.1)"
                        strokeDasharray="5 5"
                    />
                    <XAxis
                        dataKey="date"
                        interval="preserveStartEnd"
                        tickFormatter={(value: Date) =>
                            format(value, 'LLL d yyyy')
                        }
                    />
                    <YAxis allowDecimals={false} />
                    <Bar
                        dataKey="caseCount"
                        fill={theme.palette.primary.main}
                    />

                    <Tooltip
                        formatter={(value: string) => [value, 'Case count']}
                        labelFormatter={(value: Date) =>
                            format(value, 'E LLL d yyyy')
                        }
                        cursor={{ fillOpacity: 0.2 }}
                    />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
};

export default ChartView;
