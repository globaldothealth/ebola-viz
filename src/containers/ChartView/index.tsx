import { useState, useEffect } from 'react';
import { useAppSelector } from 'redux/hooks';
import { selectChartData } from 'redux/ChartView/selectors';
import { selectSelectedCountryInSideBar } from 'redux/App/selectors';
import { format } from 'date-fns';
import {
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    CartesianGrid,
    Label,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import Loader from 'components/Loader';
import Typography from '@mui/material/Typography';

import { ChartContainer } from './styled';

const ChartView = () => {
    const theme = useTheme();

    const chartData = useAppSelector(selectChartData);
    const selectedCountryInSidebar = useAppSelector(
        selectSelectedCountryInSideBar,
    );
    const [isLoading, setIsLoading] = useState(true);

    const selectedCountry = selectedCountryInSidebar
        ? selectedCountryInSidebar.name
        : 'worldwide';

    useEffect(() => {
        setIsLoading(!chartData || !chartData[selectedCountry]);
    }, [chartData, selectedCountry]);

    return (
        <>
            {isLoading ? (
                <Loader />
            ) : (
                <ChartContainer>
                    <Typography
                        variant="body1"
                        sx={{ width: '100%', textAlign: 'center' }}
                    >
                        Total confirmed cases:{' '}
                        <strong>
                            {selectedCountry.charAt(0).toUpperCase() +
                                selectedCountry.slice(1)}
                        </strong>
                    </Typography>

                    <ResponsiveContainer width="90%" height="80%">
                        <BarChart data={chartData[selectedCountry]}>
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
                                height={50}
                            >
                                <Label
                                    position="bottom"
                                    style={{ textAnchor: 'middle' }}
                                    offset={-10}
                                >
                                    Date
                                </Label>
                            </XAxis>
                            <YAxis allowDecimals={false}>
                                <Label
                                    angle={-90}
                                    position="left"
                                    offset={-10}
                                    style={{ textAnchor: 'middle' }}
                                >
                                    Confirmed cases
                                </Label>
                            </YAxis>
                            <Bar
                                dataKey="caseCount"
                                fill={theme.palette.primary.main}
                            />

                            <Tooltip
                                formatter={(value: string) => [
                                    value,
                                    'Case count',
                                ]}
                                labelFormatter={(value: Date) =>
                                    format(value, 'E LLL d yyyy')
                                }
                                cursor={{ fillOpacity: 0.2 }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            )}
        </>
    );
};

export default ChartView;
